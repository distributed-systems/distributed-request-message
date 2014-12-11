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
		 * must becalled form the child class to handle 
		 * events and th4e status of the response  correctly
		 *
		 * @param <DistributedResponseMessage> reponse message build be child class
		 */
		, _prepareResponse: function(responseMessage) {
			if (this._responseSent) throw new Error('Cannot send another response for this message, the response was sent already!');

			// marks response as sent
			this._responseSent = true;

			// store ref to reponse
			this.response = responseMessage;

			// capture message events
			responseMessage.on('message', this.emitMessage.bind(this));

			// the child class to build the message
			return null;
		}



		/**
		 * bubble messagee events downwards
		 *
		 * @param <Message> message
		 *
		 */
		, emitMessage: function(message) {
			this.emit('message', message);
		}
	});
}();
