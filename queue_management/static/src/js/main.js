odoo.define('queue_management.classes', function (require) {
'use strict';

var Class = require('web.Class');
var rpc = require('web.rpc');


var ScreenRecord = Class.extend({
    init: function (values) {
        Object.assign(this, values);
    },
    update: function () {
        var self = this;
        return rpc.query({
            model: 'queue.management.log',
            method: 'read',
            args: [[this.id]],
            kwargs: {fields: ['id', 'name', 'description']}
        }).then(function (ticket_values) {
            Object.assign(self, ticket_values[0]);
            return self;
        });
    },
});


/**
 * User
 * Represent a res.users from the Odoo Backend, with only
 * the fields [id, login, name, image_small] accessible by
 * default.
 * The User class also represent a Ticket collection.
 * @type {OdooClass}
 */
var User = Class.extend({
    init: function (values) {
        Object.assign(this, values);
        this.tickets = [];
    },
    /**
     * Fetch the default fields for the user on the server.
     * @return {jQuery.Deferred} Resolves to the udpate User.
     */
    fetchUserInfo: function () {
        var self = this;
        return rpc.query({
            model: 'res.users',
            method: 'read',
            args: [[this.id]],
            kwargs: {fields: ['id', 'login', 'name', 'image_small', 'partner_id']}
        }).then(function (user_values) {
            var values = user_values[0];
            values.partner_id = values.partner_id[0];
            Object.assign(self, values);
            return self;
        });
    },
    /**
     * Fetch all available tickets for the current user.
     * Note that the actual search is done server side
     * using the model's ACLs and Access Rules.
     * @return {jQuery.Deferred} Resolves to the udpated User
     *                           (with its Tickets collection
     *                           populated).
     */
    fetchAllTickets: function () {
        var self = this;
        return rpc.query({
            model: 'demo.ticket',
            method: 'search_read',
            args: [[]],
            kwargs: {fields: ['id', 'name', 'description']}
        }).then(function (ticket_values) {
            for (var vals of ticket_values) {
                self.tickets.push(new Ticket(vals));
            }
            return self;
        });
    },
});

return {
    Ticket: Ticket,
    User: User,
};
});
