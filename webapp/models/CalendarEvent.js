/**
 * Created by Gabi on 25/06/2015.
 */
var mongoose = require('mongoose');

var CalendarEventSchema = new mongoose.Schema({
    title: String,
    description: String,
    date: Date,
    dateCreation: Date,
    author: String,
    url: String,
    color: { type: String, default: 'blue'},
    textColor: { type: String, default: 'white'},
    display: { type: Boolean, default: false},
    allDay: { type: Boolean, default: true}
});

mongoose.model('CalendarEvent', CalendarEventSchema);