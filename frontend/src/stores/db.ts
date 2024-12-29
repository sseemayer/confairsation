import {defineStore} from 'pinia'
import PouchDB from 'pouchdb'
import {useIdentityStore} from './identity'

export type DocumentCreate = {
  _id: string,
  type: string,
}

export type Document = DocumentCreate & {
  _rev: string,
  _deleted?: boolean,
}

export enum SyncStatus {
  Disconnected = "disconnected",
  Error = "error",
  Idle = "idle",
  Active = "active",
}

/** A wrapper for the PouchDB document store **/
export const useDBStore = defineStore('db', () => {

  /** Local PouchDB handle that we write documents to  **/
  const local = new PouchDB('confairsation')

  /** Remote CouchDB instance that we synchronize changes with **/
  const remote = ref<PouchDB.Database | undefined>(undefined)

  /** Handle for active synchronization **/
  const sync = ref<PouchDB.Replication.Sync<object> | undefined>(undefined)

  /** Status for the frontend **/
  const syncStatus = ref<SyncStatus>(SyncStatus.Disconnected)

  const identityStore = useIdentityStore()

  /** The reactive object of all documents in the local PouchDB instance.
    *
    * this is used to connect the changes in PouchDB to Vue reactivity.
    */
  const documents = reactive<Record<string, Record<string, Document>>>({})

  /** Insert or update a document, returning the updated reference **/
  async function upsert<D extends DocumentCreate>(document: D): Promise<D & Document> {
    const res = await local.put(document)

    const out: D & Document = {
      ...document,
      ...{_id: res.id, _rev: res.rev},
    }

    if (!(out.type in documents)) {
      documents[out.type] = {}
    }

    documents[out.type][out._id] = out

    return out
  }

  /** Remove a document */
  async function remove<D extends Document>(document: D) {
    await local.remove(document)

    if (document.type in documents) {
      delete documents[document.type][document._id]
    }
  }

  /** Take a PouchDB document and add it to the `documents` reactive sate */
  function ingest(doc: Document) {
    if (doc._deleted) {
      if (doc.type in documents && doc._id in documents[doc.type]) {
        delete documents[doc.type][doc._id]
      }
    } else {

      if (!(doc.type in documents)) {
        documents[doc.type] = {}
      }

      documents[doc.type][doc._id] = doc
    }
  }

  /** Trigger refreshing the document list from the database */
  async function refresh() {
    const res = await local.allDocs({include_docs: true})
    for (const row of res.rows) {
      ingest(row.doc as Document)
    }
  }

  refresh()

  /** Handle synchronization while logged in */
  async function handleRemote() {
    if (identityStore.credentials) {

      const {email, password, database} = identityStore.credentials

      const url = `${location.protocol}//${encodeURIComponent(email)}:${encodeURIComponent(password)}@${location.host}/db/${database}`

      remote.value = new PouchDB(url)

      const handle = local.sync(remote.value, {live: true, retry: true})

      handle.on('change', (change) => {
        syncStatus.value = SyncStatus.Active

        for (const doc of change.change.docs) {
          ingest(doc as Document)
        }

      })

      handle.on('active', () => {
        console.log('active')
        syncStatus.value = SyncStatus.Active
      })

      handle.on('paused', (info) => {
        console.log('paused', info)
        syncStatus.value = SyncStatus.Idle
      })

      handle.on('denied', (info) => {
        console.log('denied', info)
        syncStatus.value = SyncStatus.Error
      })

      handle.on('error', (err) => {
        console.log('error', err)
        syncStatus.value = SyncStatus.Error
      })


      sync.value = handle

    } else {
      if (sync.value) {
        sync.value.cancel()
        sync.value = undefined
      }

      syncStatus.value = SyncStatus.Disconnected
    }
  }

  watch(identityStore, handleRemote)

  return {
    db: local, documents, syncStatus,
    refresh,
    upsert, remove
  }
})
