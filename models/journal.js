const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
    title: String,
    owner: {
        type: String,
        required: true,
    },
    notes: [{
        title: String,
        body: String,
        lastModified: Date,
        cities: [{
            name: String
        }]
    }]
});

const librarySchema = new mongoose.Schema({
    owner: {
        type: String,
        required: true,
        unique: true,
    },
    journals: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'journal'
    }]
});

librarySchema.statics.getJournals = async function(username){
    try {
        const journals = await Library.findOne({owner: username}).populate('journals').lean().exec();
        return journals.journals;
    } catch (err) {
        console.log("Error getting journals from db", err);
    }
}

// add journal to user's library
librarySchema.statics.addJournal = function(username, title) {
    try {
        Library.findOne({owner: username}).then((lib) => {
            Journal.create({title: title, owner: username})
            .then((j) => {
                lib.journals.push(j);
                lib.save();
                console.log('Journal Added');
            });
        })
    } catch (err) {
        console.log("Error creating journal graphic", err);
    }
}

librarySchema.statics.deleteJournal = async function(username, journalID) {
    try {
        this.updateOne(
            {owner: username},
            {$pullAll: {journals: [{_id: journalID}]}}
        );
    } catch (err) {
        console.log("error:", err);
    }
}

// for testing purposes
journalSchema.statics.createFakeData = async function(journalId) {
    console.log("goes to create the fake data");
    const note1 = {
        title: "first note",
        body: "this is the body of the first note",
        lastModified: "2023-10-20",
        cities: [
            {
                name: "San Juan"
            },
            {
                name: "Carolina"
            }
        ]
    };
    const note2 = {
        title: "second note",
        body: "this is the body of the SECOND note. Now this may be a lot longerrrrr",
        lastModified: "2023-10-20",
        cities: [
            {
                name: "Granada"
            },
            {
                name: "Sevilla"
            }
        ]
    };
    const newNotes = [note1, note2];
    console.log(journalId);
    var j_id = new mongoose.Types.ObjectId(String(journalId))
    await Journal.updateOne({_id: j_id}, {$set : {notes: newNotes}});
}

const Journal = mongoose.model('journal', journalSchema);
const Library = mongoose.model('library', librarySchema, 'libraries');
module.exports = { Journal, Library };