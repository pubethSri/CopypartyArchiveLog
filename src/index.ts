import { Elysia, t } from 'elysia'

const uploadLogs: any[] = []

function determineCategory(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''

  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) return 'Audio'
  if (['jpg', 'jpeg', 'png', 'webp', 'bmp'].includes(ext)) return 'Image'
  if (ext === 'gif') return 'Gif'
  if (['sh', 'bat', 'ps1', 'py'].includes(ext)) return 'Scripts'
  if (['txt', 'md', 'json', 'log', 'conf'].includes(ext)) return 'Text'
  if (['exe', 'msi', 'dll', 'bin'].includes(ext)) return 'Suspicious'

  return 'File' // Default
}

const app = new Elysia()
  .get('/', () => Bun.file('public/index.html'))
  .get('/api/logs', () => {
    return uploadLogs.slice().reverse()
  })
  .post('/webhook',
    ({ body: { filename, size } }) => {
      const category = determineCategory(filename)

      const newLog = {
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        filename: filename,
        size: size,
        category
      }

      uploadLogs.push(newLog)
      if (uploadLogs.length > 50) uploadLogs.shift()

      console.log(`Logged: ${filename} [${category}]`)

      return { status: 'success', message: 'Log received', category }
    }, {
    body: t.Object({
      filename: t.String(),
      size: t.String()
    })
  }
  )
  .listen(3000)

console.log(
  `Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)