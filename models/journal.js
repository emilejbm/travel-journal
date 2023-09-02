const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
    title: String,
    owner: {
        type: String,
        required: true,
    },
    content: [{
        sections: [{
            title: String,
            notes: [{
                title: String,                            
                body: String,
                cities: [{
                    name: String
                }]
            }]
        }]
    }]
});

const librarySchema = new mongoose.Schema({
    owner: {
        type: String,  // _id from users collection
        required: true,
        unique: true,
    },
    journals: [{
        journal: { type: mongoose.Schema.Types.ObjectId, ref: 'journalSchema' },
    }]
});

librarySchema.statics.getJournals = async function(username){
    try {
        const lib = this.findOne({username: username})
        if (lib) {
            console.log("found library")
            return lib.get("journals")
        } else {
            console.log("error: library could not be found")
        }
    } catch (err) {
        console.log("error:", err)
    }
}

librarySchema.statics.addJournal = async function(username) {
    try {
        const journal = await Journal.create({title: "untitled", owner: username});
        await this.updateOne(
            {owner: username},
            {$push: {journals: journal}}
        );
    } catch (err) {
        console.log("error:", err)
    }
}

librarySchema.statics.deleteJournal = async function(username, journalID) {
    try {
        this.updateOne(
            {owner: username},
            {$pullAll: {journals: [{_id: journalID}]}}
        );
    } catch (err) {
        console.log("error:", err)
    }
}


journalSchema.methods.updateTitle = async function(newTitle){
    this.title = newTitle;
    await this.save();
}

journalSchema.methods.updateSectionTitle = async function(newcontent) {
    // this.content.sections
    return null;
}

journalSchema.methods.updateNotesTitle = async function(newcontent) {
    return null;
}

journalSchema.methods.updateNotesBody = async function(newcontent) {
    return null;
}

journalSchema.methods.updateCities = async function(newcontent) {
    return null;
}

const Journal = mongoose.model('journal', journalSchema);
const Library = mongoose.model('library', librarySchema, 'libraries');
module.exports = { Journal, Library };