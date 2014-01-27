/**
 * @jsx React.DOM
 */

/*
== BSD2 LICENSE ==
Copyright (c) 2014, Tidepool Project

This program is free software; you can redistribute it and/or modify it under
the terms of the associated License, which is identical to the BSD 2-Clause
License as published by the Open Source Initiative at opensource.org.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the License for more details.

You should have received a copy of the License along with this program; if
not, you can obtain one from Tidepool Project at tidepool.org.
== BSD2 LICENSE ==
*/

var React = require('react');

var FooterBar = React.createClass({

    handleAction:function(){

        this.props.onActionHandled();
    },

    render: function() {
        return (
            /* jshint ignore:start */
            <nav className="navbar navbar-default navbar-fixed-bottom">
                <button type="button" ref='actionBtn' className="btn footer-btn" onClick={this.handleAction}>{this.props.actionName}</button>
            </nav>
            /* jshint ignore:end */
        );
    }
});

module.exports = FooterBar;