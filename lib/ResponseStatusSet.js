!function() {

	var   Class 		= require('ee-class')
		, type 			= require('ee-types')
		, log 			= require('ee-log');


	/*
	 * set of statuses that can be used for response
	 */
	module.exports = new Class({

		init: function(statuses) {
			this._statuses = {};

			if (statuses) {
				statuses.forEach(function(status) {
					this._statuses[status] = true;
				}.bind(this));
			}
		}



		/**
		 * sets the statuses as uppercase properties on an object
		 *
		 * @param <Object> object to apply the statuses to
		 */
		, applyTo: function(target) {
			Object.keys(this._statuses).forEach(function(name) {
				target[name.toUpperCase()] = name;
			});
		}



		
		/** 
		 * setter builder for response statuses
		 */
		, setter: function() {
			var _this = this;

			return function(status) {
				if (!type.string(status)) throw new Error('The status must be typeof string, «'+type(status)+'» given!');
                else if (!_this._statuses[status]) throw new Error('Valid statuses are «'+Object.keys(_this._statuses).join(', ')+'», «'+status+'» given!');
                else this._status = status;
			};
		}


		/** 
		 * gettrer builder for response statuses
		 */
		, getter: function() {
			return function() {
				return this._status;
			};
		}
	});
}();
