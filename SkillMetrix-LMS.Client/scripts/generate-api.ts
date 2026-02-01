import { execSync } from 'child_process'

const SWAGGER_URL_HTTPS = 'https://localhost:7218/swagger/v1/swagger.json'
const SWAGGER_URL_HTTP = 'http://localhost:5015/swagger/v1/swagger.json'
const OUTPUT_FILE = 'src/api/types.ts'

function findAvailableSwaggerUrl(): string {
  // Try HTTPS first
  try {
    execSync(`curl -s -k -f "${SWAGGER_URL_HTTPS}"`, {
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 3000
    })
    return SWAGGER_URL_HTTPS
  } catch {
    // Try HTTP as fallback
    try {
      execSync(`curl -s -f "${SWAGGER_URL_HTTP}"`, {
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 3000
      })
      return SWAGGER_URL_HTTP
    } catch {
      throw new Error('Backend is not running or Swagger is not accessible')
    }
  }
}

console.log('Generating API types from Swagger...')

let swaggerUrl: string
try {
  swaggerUrl = findAvailableSwaggerUrl()
  console.log(`Fetching from: ${swaggerUrl}`)
} catch (error) {
  console.error('Failed to find Swagger endpoint')
  console.error('Make sure the backend API is running:')
  console.error('  cd SkillMetrix-LMS.API && dotnet run')
  console.error(`  Tried: ${SWAGGER_URL_HTTPS}`)
  console.error(`  Tried: ${SWAGGER_URL_HTTP}`)
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`)
  }
  process.exit(1)
}

try {
  execSync(
    `openapi-typescript "${swaggerUrl}" -o "${OUTPUT_FILE}"`,
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_TLS_REJECT_UNAUTHORIZED: '0',
      },
    }
  )
  console.log(`Successfully generated types to ${OUTPUT_FILE}`)
} catch (error) {
  console.error('Failed to generate API types')
  if (error instanceof Error) {
    console.error('Error:', error.message)
  }
  process.exit(1)
}
