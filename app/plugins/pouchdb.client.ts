import PouchDB from 'pouchdb'

export default defineNuxtPlugin(() => {
  // Local database
  const db = new PouchDB('my_local_db')

  // Remote CouchDB (optional)
  const remoteDb = new PouchDB('http://admin:password@localhost:5984/my_remote_db')

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
