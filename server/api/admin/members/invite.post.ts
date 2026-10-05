import { createClient } from '@supabase/supabase-js'
import {
  createError,
  defineEventHandler,
  getHeader,
  readBody
} from 'h3'

interface InviteMemberBody {
  memberId: string
}

interface MemberRow {
  id: string
  user_id: string | null
  number: string
  full_name: string
  email: string
  status: 'pending' | 'active' | 'inactive'
}

interface ProfileRow {
  role: 'member' | 'direction' | 'admin'
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  const supabaseUrl =
    config.public.supabaseUrl

  const supabaseAnonKey =
    config.public.supabaseAnonKey

  const serviceRoleKey =
    config.supabaseServiceRoleKey

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    !serviceRoleKey
  ) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'A configuração privada do Supabase está incompleta.'
    })
  }

  /*
   * Recebemos a sessão do administrador através
   * do Authorization header.
   */
  const authorization =
    getHeader(event, 'authorization')

  if (
    !authorization ||
    !authorization.startsWith('Bearer ')
  ) {
    throw createError({
      statusCode: 401,
      statusMessage:
        'Sessão de administração em falta.'
    })
  }

  const accessToken =
    authorization.replace('Bearer ', '').trim()

  /*
   * Cliente normal usado apenas para validar
   * o access token recebido.
   */
  const authClient = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  )

  const {
    data: userData,
    error: userError
  } = await authClient.auth.getUser(
    accessToken
  )

  if (
    userError ||
    !userData.user
  ) {
    throw createError({
      statusCode: 401,
      statusMessage:
        'Sessão inválida ou expirada.'
    })
  }

  /*
   * Este cliente usa a chave privada e existe
   * apenas no servidor.
   */
  const adminClient = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  )

  /*
   * Mesmo tendo uma chave administrativa,
   * não confiamos apenas no frontend:
   * verificamos novamente o role do utilizador.
   */
  const {
    data: profileData,
    error: profileError
  } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle()

  if (profileError) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Não foi possível verificar as permissões.'
    })
  }

  const profile =
    profileData as ProfileRow | null

  if (
    !profile ||
    (
      profile.role !== 'admin' &&
      profile.role !== 'direction'
    )
  ) {
    throw createError({
      statusCode: 403,
      statusMessage:
        'Não tens permissões para criar contas de sócio.'
    })
  }

  const body =
    await readBody<InviteMemberBody>(event)

  if (!body?.memberId) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'O identificador do sócio é obrigatório.'
    })
  }

  const {
    data: memberData,
    error: memberError
  } = await adminClient
    .from('members')
    .select(`
      id,
      user_id,
      number,
      full_name,
      email,
      status
    `)
    .eq('id', body.memberId)
    .maybeSingle()

  if (memberError) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Não foi possível consultar o sócio.'
    })
  }

  if (!memberData) {
    throw createError({
      statusCode: 404,
      statusMessage:
        'Sócio não encontrado.'
    })
  }

  const member =
    memberData as MemberRow

  if (member.user_id) {
    return {
      success: true,
      alreadyLinked: true,
      message:
        'Este sócio já tem uma conta associada.'
    }
  }

  if (member.status !== 'active') {
    throw createError({
      statusCode: 400,
      statusMessage:
        'A conta online só pode ser criada para um sócio ativo.'
    })
  }

  if (!member.email) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'O sócio não tem um email registado.'
    })
  }

  const siteUrl =
    String(config.public.siteUrl)
      .replace(/\/$/, '')

  const redirectTo =
    `${siteUrl}/socios/definir-password`

  /*
   * O Supabase cria o utilizador e envia
   * automaticamente o convite por email.
   */
  const {
    data: inviteData,
    error: inviteError
  } =
    await adminClient.auth.admin
      .inviteUserByEmail(
        member.email,
        {
          data: {
            full_name:
              member.full_name,

            member_number:
              member.number
          },

          redirectTo
        }
      )

  if (
    inviteError ||
    !inviteData.user
  ) {
    throw createError({
      statusCode: 400,
      statusMessage:
        inviteError?.message ||
        'Não foi possível criar a conta do sócio.'
    })
  }

  const createdUser =
    inviteData.user

  /*
   * Ligamos agora a conta Auth ao registo
   * interno do sócio.
   */
  const {
    error: updateMemberError
  } = await adminClient
    .from('members')
    .update({
      user_id: createdUser.id
    })
    .eq('id', member.id)

  if (updateMemberError) {
    /*
     * Evita deixar uma conta Auth órfã caso
     * a associação ao sócio falhe.
     */
    await adminClient.auth.admin
      .deleteUser(createdUser.id)

    throw createError({
      statusCode: 500,
      statusMessage:
        'A conta foi criada, mas não foi possível associá-la ao sócio.'
    })
  }

  /*
   * Criamos também o perfil correspondente.
   */
  const {
    error: profileInsertError
  } = await adminClient
    .from('profiles')
    .upsert({
      id: createdUser.id,
      full_name: member.full_name,
      role: 'member'
    })

  if (profileInsertError) {
    await adminClient
      .from('members')
      .update({
        user_id: null
      })
      .eq('id', member.id)

    await adminClient.auth.admin
      .deleteUser(createdUser.id)

    throw createError({
      statusCode: 500,
      statusMessage:
        'Não foi possível criar o perfil da conta.'
    })
  }

  return {
    success: true,
    alreadyLinked: false,
    message:
      `Convite enviado para ${member.email}.`
  }
})