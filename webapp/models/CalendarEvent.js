/**
 * Created by Gabi on 25/06/2015.
 */
var mongoose = require('mongoose');

var CalendarEventSchema = new mongoose.Schema({
    title: String,
    description: String,
    oeuvre_id: String,
    date: Date,
    dateCreation: Date,
    author: String,
    url: String,
    color: { type: String, default: '#6FC2F4'},
    textColor: { type: String, default: '#e9ebf8'},
    display: { type: Boolean, default: false},
    allDay: { type: Boolean, default: true}
});

mongoose.model('CalendarEvent', CalendarEventSchema);