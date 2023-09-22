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
        cities: [{
            name: String
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
        type: mongoose.Schema.Types.ObjectId, ref: 'journal'
    }]
});

// librarySchema.pre('save', function(next){
//     Journal.insertMany(this.journals, function(err, res){
//         if(err) throw err;
//         next();
//     })
// });

librarySchema.statics.getJournals = async function(username){
    // try {
    //     return this.findOne({owner:username}).populate('journals').lean();
    // } catch (err) {
    //     console.log(err);
    // }
    // this.findOne({owner:username}).then((lib) => {
    //     console.log("lib journals are", lib);
    //     return lib.journals;
    // })
    //Library.findOne({owner: username}).populate('journals').lean()
    // Library.findOne({owner:username}).then((lib) => {
    //     console.log("lib is", lib);
    //     return lib.journals;
    // });
    const journals = await Library.findOne({owner: username}).populate('journals').lean().exec();
    return journals.journals;
    //return lib;
}

// add journal to user's library
librarySchema.statics.addJournal = function(username, title) {
    Library.findOne({owner: username})
    .then((lib) => {
        Journal.create({title: title, owner: username})
        .then((j) => {
            lib.journals.push(j);
            lib.save();
            console.log('Journal Added');
        });
    })
    .catch((err) => {
        console.log(err);
    });
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