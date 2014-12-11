!function() {

	var   Class 				= require('ee-class')
		, type 					= require('ee-types')
		, log 					= require('ee-log')
        , Arguments             = require('ee-arguments')
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
		 * @param <Arguments> arguments object passed to the orignal message
		 */
		, _prepareResponse: function(responseMessage, args) {
			if (this._responseSent) throw new Error('Cannot send another response for this message, the response was sent already!');

			var   args      = new Arguments(args)
                , content   = args.get('array', args.get('null', args.get('object')))
                , headers   = (content === null || type.array(content)) ? args.get('object') : args.getByIndex('object', 1)
                , status    = args.get('string');


			// marks response as sent
			this._responseSent = true;

			// store ref to reponse
			this.response = responseMessage;

			// capture message events
			responseMessage.on('message', this.emitMessage.bind(this));


            // set data collected from the callers arguments
            if (content) responseMessage.content = content;
            if (headers) responseMessage.headers = headers;
            if (status)  responseMessage.status  = status;

            
            // set sender && receiver
            if (this.recipient  && (this.recipient.uid  || this.recipient.id))  responseMessage.sender     = this.recipient;
            if (this.sender     && (this.sender.uid     || this.sender.id))     responseMessage.recipient  = this.sender;


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
