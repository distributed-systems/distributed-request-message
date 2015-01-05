!function() {

	var   Class 				= require('ee-class')
		, type 					= require('ee-types')
		, log 					= require('ee-log')
		, DistributedMessage 	= require('distributed-message');



	module.exports = new Class({
		inherits: DistributedMessage

		// flags if a final response was sent
		, _responseSent: false
		

		// isSent flag, readonlys
		, isSent: {
			get: function() {return this._responseSent;}
		}

		
		/**
		 * this method must be called as super from the child
		 * class, it handles the status
		 *
		 */
		, send: function() {
			if (this._responseSent) throw new Error('Cannot send the message a secod time, it was sent already!');

			// marks response as sent
			this._responseSent = true;

			// send myself
			this.emit('message', this);
		}
	});
}();
