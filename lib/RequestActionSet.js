!function() {

	var   Class 		= require('ee-class')
		, type 			= require('ee-types')
		, log 			= require('ee-log');


	/*
	 * set of action that can be used for requests
	 */
	module.exports = new Class({

		init: function(actions) {
			this._actions = {};

			if (actions) {
				actions.forEach(function(action) {
					this._actions[action] = true;
				}.bind(this));
			}		
		}


		/**
		 * sets the actiosn as uppercase properties on an object
		 *
		 * @param <Object> object to apply the actions to
		 */
		, applyTo: function(target) {
			Object.keys(this._actions).forEach(function(name) {
				target[name.toUpperCase()] = name;
			});
		}



		/** 
		 * setter builder for request actions
		 */
		, setter: function() {
			var _this = this;

			return function(action) {
				if (!type.string(action)) throw new Error('The action must be typeof string, «'+type(action)+'» given!');
                else if (!_this._actions[action]) throw new Error('Valid actions are «'+Object.keys(_this._actions).join(', ')+'», «'+action+'» given!');
                else this._action = action;
			};
		}


		/** 
		 * gettrer builder for request actions
		 */
		, getter: function() {
			return function() {
				return this._action;
			};
		}
	});
}();
