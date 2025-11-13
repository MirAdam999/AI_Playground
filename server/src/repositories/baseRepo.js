import { ObjectId } from "mongodb";
import { client, connectDB } from "./dbConn.js";

/**
* Mama of all db models. Supports full CRUD.
*/

export class BaseRepo {
    static collectionName = '';

    static async accessCollection() {
        await connectDB(); // ensure client is connected
        if (!this.collectionName) throw new Error('Collection name not defined');
        return client.db().collection(this.collectionName);
    }

    /**
    * @param {JSON} data 
    * @returns {string | false}
    */
    static async addObj(data) {
        let output
        try {
            const collection = await this.accessCollection()
            const newObj = await collection.insertOne(data)
            output = newObj.insertedId?.toString() || false
            return output
        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`[${this.name}] addObj(${data}) ->`, output)
        }
    }

    /**
    * @param {string} id 
    * @returns {JSON | false | null} 
    */
    static async getObjByID(id) {
        let output
        try {
            const collection = await this.accessCollection()
            const result = await collection.findOne({ _id: new ObjectId(id) })
            output = result || null
            return output
        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`[${this.name}] getObjById(${id}) ->`, output)
        }
    }

    /**
    * @param {JSON} filters 
    * @returns {JSON | false | null} 
    */
    static async getObjByFIlters(filters) {
        let output
        try {
            const collection = await this.accessCollection()
            const result = await collection.find(filters).toArray()
            output = result.length ? result.map(r => ({ ...r, _id: r._id.toString() })) : null;
            return output
        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`[${this.name}] getObjByFIlters(${filters}) ->`, output)
        }
    }

    /**
    * @returns {Array[JSON] | Array[] | null} 
    */
    static async getAllObj() {
        let output
        try {
            const collection = await this.accessCollection()
            const result = await collection.find().toArray()
            output = result.length ? result.map(r => ({ ...r, _id: r._id.toString() })) : [];
            return output
        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`[${this.name}] getAllObj() ->`, output)
        }
    }

    /**
    * @param {string} id
    * @param {JSON} data 
    * @returns {boolean} 
    */
    static async updateObj(id, data) {
        let output
        try {
            const collection = await this.accessCollection()
            const update = await collection.updateOne({ _id: new ObjectId(id) }, { $set: data })
            output = update.modifiedCount > 0 ? true : false
            return output
        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`[${this.name}] updateObj(${id},${data}) ->`, output)
        }
    }

    /**
    * @param {string} id
    * @returns {boolean} 
    */
    static async deleteObj(id) {
        try {
            const collection = await this.accessCollection()
            const del = await collection.deleteOne({ _id: new ObjectId(id) })
            output = del.deletedCount > 0 ? true : false
            return output
        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`[${this.name}] deleteObj(${id}) ->`, output)
        }
    }

}
