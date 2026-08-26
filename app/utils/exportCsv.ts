type CsvValue = string | number | boolean | null | undefined

interface CsvColumn<T> {
  key: keyof T | string
  label: string
}

const FILE_SEPARATOR = '\t'

const escapeCellValue = (value: CsvValue) => {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)
    .replace(/\r?\n/g, ' ')
    .replace(/"/g, '""')

  return `"${stringValue}"`
}

const encodeUtf16Le = (content: string) => {
  const buffer = new ArrayBuffer(content.length * 2)
  const view = new DataView(buffer)

  for (let i = 0; i < content.length; i++) {
    view.setUint16(i * 2, content.charCodeAt(i), true)
  }

  return buffer
}

export const exportRowsToCsv = <T extends Record<string, CsvValue>>(
  filename: string,
  columns: CsvColumn<T>[],
  rows: T[]
) => {
  if (import.meta.server) {
    return
  }

  const header = columns
    .map((column) => escapeCellValue(column.label))
    .join(FILE_SEPARATOR)

  const body = rows
    .map((row) => {
      return columns
        .map((column) => {
          return escapeCellValue(row[column.key])
        })
        .join(FILE_SEPARATOR)
    })
    .join('\r\n')

  const fileContent = `${header}\r\n${body}`

  const bom = new Uint8Array([0xff, 0xfe])
  const encodedContent = encodeUtf16Le(fileContent)

  const blob = new Blob([bom, encodedContent], {
    type: 'text/tab-separated-values;charset=utf-16le;'
  })

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename.replace('.csv', '.tsv')
  link.click()

  URL.revokeObjectURL(url)
}