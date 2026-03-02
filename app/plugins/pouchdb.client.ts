import PouchDB from 'pouchdb'

export default defineNuxtPlugin(() => {
  // Local database
  const db = new PouchDB('my_local_db')

  // Remote CouchDB (optional)
  const remoteDb = new PouchDB('https://admin:password@ef0c-2001-e68-5425-1d07-edd6-679-ed5-41e3.ngrok-free.app/my_remote_db')

  // Sync (optional)
  db.sync(remoteDb, { live: true, retry: true }).on('error', function (err) {
    // Handle errors
    console.log(err)
  })

  return {
    provide: {
      pouch: db
    }
  }
})
