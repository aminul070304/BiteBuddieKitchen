const production = 'production'
const development = 'development'

const mode = development
let base_url = ''

if (mode === production) {
    base_url = ""
} else {
    base_url = 'https://api.bitebuddie.com/api'
}

export { base_url }