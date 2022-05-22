import mongoose from 'mongoose'

const connstring = String(process.env.DB_URL)

async function init(): Promise<void> {
  await mongoose.connect(connstring)
}

export default { init }
