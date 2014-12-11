
	
	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, assert 		= require('assert');



	var RequestMessage = require('../')



	describe('A RequestMessage', function(){
		it('should not crash when instantiated', function() {
			new RequestMessage();
			new RequestMessage.Response();
			new RequestMessage.ActionSet();
			new RequestMessage.StatusSet();
		});


		it('should mark the response as sent if the response was created', function() {
			var   msg 		= new RequestMessage();
			
			msg._prepareResponse(new RequestMessage.Response());

			assert(msg.isSent);
		});


		it('should emit a message when a response is sent', function(done) {
			var   msg 		= new RequestMessage()
				, response 	= new RequestMessage.Response();
			
			msg._prepareResponse(response);

			msg.on('message', function(message) {
				assert(message);
				done();
			});

			response._send();
		});


		it('should throw when a response is sent twice', function() {
			var   msg 		= new RequestMessage()
				, response 	= new RequestMessage.Response();
			
			msg._prepareResponse(response);

			response._send();


			assert.throws(function() {
				response._send();
			});			
		});


		it('should throw when a response is prepared twice', function() {
			var   msg 		= new RequestMessage()
				, response 	= new RequestMessage.Response();
			
			msg._prepareResponse(response);
			
			assert.throws(function() {
				msg._prepareResponse(response);
			});						
		});


		it('should implement the actionSet correctly', function() {
			var   actions = new RequestMessage.ActionSet(['create'])
				, MyRequest
				, request;

			MyRequest = new Class({
				action: {
					  set: actions.setter()
					, get: actions.getter()
				}
			});

			request = new MyRequest();

			actions.applyTo(MyRequest);

			request.action = MyRequest.CREATE;

			assert.throws(function() {
				request.action = 'sdsd';
			});

			assert.equal(request.action, 'create');
		});



		it('should implement the StatusSet correctly', function() {
			var   statuses = new RequestMessage.StatusSet(['ok'])
				, MyResponse
				, response;

			MyResponse = new Class({
				status: {
					  set: statuses.setter()
					, get: statuses.getter()
				}
			});


			statuses.applyTo(MyResponse);


			response = new MyResponse();


			response.status = MyResponse.OK;

			assert.throws(function() {
				response.status = 'sdsd';
			});

			assert.equal(response.status, 'ok');
		});
	});
	