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
    * @param {string} id 
    * @returns {JSON/false/null} 
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
    * @returns {Array[JSON]/false/null} 
    */
    static async getAllObj() {
        let output
        try {
            const collection = await this.accessCollection()
            const result = await collection.find().toArray()
            output = result.length ? result.map(r => ({ ...r, _id: r._id.toString() })) : null;
            return output
        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`[${this.name}] getAllObj() ->`, output)
        }
    }

    static async deleteObj(id) {
        try {
            const collection = await this.accessCollection()
            const del = await collection.findOneAndDelete({ _id: new ObjectId(id) })
            output = del || false
            return output
        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`[${this.name}] deleteObj(${id}) ->`, output)
        }
    }

}
