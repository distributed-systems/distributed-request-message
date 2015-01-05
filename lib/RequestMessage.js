!function() {

	var   Class 				= require('ee-class')
		, type 					= require('ee-types')
		, log 					= require('ee-log')
        , Arguments             = require('ee-arguments')
        , Promise 				= (Promise || require('es6-promise').Promise)
		, DistributedMessage 	= require('distributed-message')
		, ResponseMessage 		= require('./ResponseMessage');



	module.exports = new Class({
		inherits: DistributedMessage

		
		// flags if a final response was sent
		, _responseSent: false

		// flags this message as sent
		, _isSent: false



		// isSent flag, readonly
		, isSent: {
			get: function() {return this._isSent;}
		}

		// responseSent flag, readonly
		, responseSent: {
			get: function() {return this._responseSent;}
		}



		/**
		 * constructor, the object may contain a reference to a service
		 * so it can send itself
		 *
		 * @param <Object> options object
		 */
		, init: function init(options, messageHandler) {

			if (options) {
				// the user passed the service inside the options object
				if (options.messageHandler) this._messageHandler = options.messageHandler;

				// the user passed a separate opiotns object
				else if (messageHandler) this._messageHandler = messageHandler;
			}

			// set as reposne type message
			this._hasResponse = true;

			// call super
			init.super.call(this, options);
		}




		/**
		 * send this message
		 *
		 * @param <Function> optional callback
		 *
		 * @returns <Mixed> Promise or undeifned (if a callback was passed)
		 */
		, send: function(messageHandler, callback) {
			var promise, reject, resolve;

			if (type.function(messageHandler)) {
				callback  		= messageHandler;
				messageHandler  = this._messageHandler;
			}

			if (!this._isSent) {
				if (type.object(messageHandler) && type.function(messageHandler.emitMessage)) {

					this._isSent = true;

					// send myself
					process.nextTick(function() {
						messageHandler.emitMessage(this);
					}.bind(this));
						
					if (callback) this._callback = callback;
					else {
						// create promise, cache variables in this scope
						promise = new Promise(function(_resolve, _reject) {
							resolve = _resolve;
							reject = _reject;
						}.bind(this));

						// define callback
						this._callback = function(err, message) {
							if (err) reject(err);
							else resolve(message);
						}.bind(this);

						// return the promise
						return this._promise;
					}
				}
				else throw new Error('Cannot send the message, there was no messageHandler passed to it (via the classes constructor options or the send method)!');
			}
			else throw new Error('Cannot send message, the message was already sent!');
		}




        /**
         * send a response to this message
         *
         * @param <Mixed> first object or any array or null found: content
         * @apram <Mixed> second object or first object in combination with null encountered: headers
         * @param <Mixed> first string encountered: status
         */
        , sendResponse: function() {
        	if (!this._responseSent) {
            	return this.createResponse.apply(this, Array.prototype.slice.call(arguments)).send();
            }
			else throw new Error('Cannot send a response, the response was already sent!');
        }




        /**
         * create a response for this message
         *
         * @param <Mixed> first object or any array or null found: content
         * @apram <Mixed> second object or first object in combination with null encountered: headers
         * @param <Mixed> first string encountered: status
         */
        , createResponse: function() {
            var message = new ResponseMessage();

            // validate, set flags
            this._prepareResponse(message, arguments);

            // return the message
            return message;
        }



        /**
         * handle the response
         *
         * @param <ResponseMessage> message instance
         */
        , _handleResponse: function(responseMessage) {
        	if (this._callback) this._callback(null, responseMessage);
        	else throw new Error('Failed to deliver reponse, no callback registered!');
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

            // validate message
            if (!responseMessag instanceof ResponseMessage) throw new Error('Cannot prepare a message that doesn\'t inherit from the ResponseMessage type!');

			// store ref to reponse
			this.response = responseMessage;


            // set data collected from the callers arguments
            if (content) responseMessage.content = content;
            if (headers) responseMessage.headers = headers;
            if (status)  responseMessage.status  = status;

            
            // set sender && receiver
            if (this.recipient  && (this.recipient.uid  || this.recipient.id))  responseMessage.sender     = this.recipient;
            if (this.sender     && (this.sender.uid     || this.sender.id))     responseMessage.recipient  = this.sender;


            // wait for a the response to be sent
            responseMessage.on('message', this._handleResponse.bind(this));


			// the child class to build the message
			return null;
		}
	});
}();
