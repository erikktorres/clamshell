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

'use strict';

var React = require('react');
var Router = require('director').Router;
var bows = require('bows');
var _ = require('underscore');
var platform = require('platform-client');

//app components
/*jshint unused:true */
var Layout = require('./layout/Layout');
var ListNavBar = require('./components/ListNavBar');
var MessageFooter = require('./components/MessageFooter');
var Login = require('./components/Login');
var MyGroupsPicker = require('./components/GroupsPicker');
var GroupNotes = require('./components/GroupNotes');
var MessageItemList = require('./components/MessageItemList');
/*jshint unused:false */

//core functionality
var auth = require('./core/auth');
var api = require('./core/api');

var app = {
  log: bows('App'),
  auth:auth,
  api:api
};

var routes = {
  login:'login',
  messagesForAllTeams:'allGroupsConversations',
  messagesForSelectedTeam:'groupConversations',
  messageThread: 'conversationThread',
  startMessageThread:'newConversation'
};

require('./ClamShellApp.css');

var ClamShellApp = React.createClass({
  getInitialState: function () {
    return this.initializeAppState();
  },

  //starting state for the app when first used or after logout
  initializeAppState : function(){
    return {
      routeName: routes.login,
      previousRoute: null,
      authenticated: app.auth.isAuthenticated(),
      user: null,
      userGroupsWithMessages:null,
      selectedGroup: null,
      messagesToShow : null,
      loggingOut: false
    };
  },

  componentDidMount: function () {

    console.log('setup ...');
    if (this.state.authenticated) {
      this.fetchUserData();
      var currentRoute = this.state.routeName;
      this.setState({routeName: routes.messagesForAllTeams, previousRoute : currentRoute});
    }

    var router = new Router({
      '/': this.setState.bind(this, {routeName: routes.login}),
      '/allGroupsConversations': this.setState.bind(this, {routeName: routes.messagesForAllTeams}),
      '/groupConversations': this.setState.bind(this, {routeName: routes.messagesForSelectedTeam}),
      '/conversationThread': this.setState.bind(this, {routeName: routes.messageThread}),
      '/newConversation': this.setState.bind(this, {routeName: routes.startMessageThread})
    });
    router.init();
  },

  // ---------- Utility Methods ----------

  //TODO: move this out and test it
  messagesForThread:function(groupId,rootMessageId){

    var messageGroup = _.find(this.state.userGroupsWithMessages, function(group){ return groupId == group.id; });
    var messagesInThread = _.where(messageGroup.messages, {rootmessageid: rootMessageId});

    var messages;

    if(messagesInThread.length > 0){
      messages = _.sortBy(messagesInThread, function(message){ return message.timestamp; });
    }else{
      messages = _.where(messageGroup.messages, {id: rootMessageId});
    }

    return messages;

  },

  //load the user and then thier groups and those groups messages
  fetchUserData: function() {
    var self = this;
    app.api.user.get(function(err, user) {
      self.setState({user: user});
      app.api.groups.get(user,function(err, userGroupsWithMessages) {
        self.setState({userGroupsWithMessages:userGroupsWithMessages});
      });
    });
  },

  //---------- App Handlers ----------

  handleLogout:function(){
    var self = this;
    app.auth.logout(function(){
      self.setState(self.initializeAppState());
    });
  },

  handleBack:function(){
    var previousRoute = this.state.previousRoute;
    this.setState({routeName:previousRoute});
  },

  handleLoginSuccess:function(){
    this.setState({authenticated: true});
    this.fetchUserData();

    var currentRoute = this.state.routeName;
    this.setState({routeName: routes.messagesForAllTeams, previousRoute : currentRoute});
  },

  handleShowConversationThread:function(mostRecentMessageInThread){

    var messagesId = mostRecentMessageInThread.id;

    if(mostRecentMessageInThread.rootmessageid){
      messagesId = mostRecentMessageInThread.rootmessageid;
    }

    var messages = this.messagesForThread(mostRecentMessageInThread.groupid,messagesId);

    var currentRoute = this.state.routeName;
    this.setState({messagesToShow: messages,routeName:routes.messageThread, previousRoute : currentRoute});
  },

  handleStartingNewConversation:function(){
    var currentRoute = this.state.routeName;
    this.setState({routeName:routes.startMessageThread,previousRoute : currentRoute});
  },

  handleStartConversation:function(note){
//TODO: sort this out
    var newConversation = {
      id:'2222aca5-b0f0-4ae1-8888-8314350ac1fb',
      rootmessageid : '',
      userid : '4505aca5-b0f0-4ae1-9443-8314350ac1fb',
      groupid : this.state.selectedGroup[0].id,
      timestamp : Date('MM-DD-YYYY HH:mm:ss'),
      messagetext : note.text
    };

//TODO: sort this out

    var currentRoute = this.state.routeName;
    this.setState({routeName:routes.messageThread, messagesToShow: [newConversation], previousRoute : currentRoute});
  },

  handleAddingToConversation:function(e){
    console.log('send ['+e.text+']');
    console.log('add to existing converstaion');
  },

  handleGroupChanged:function(e){
    var group = _.find(this.state.userGroupsWithMessages, function(group){ return e.groupId == group.id; });
    var currentRoute = this.state.routeName;
    this.setState({routeName:routes.messagesForSelectedTeam,selectedGroup:[group],previousRoute : currentRoute});
  },

  //---------- Rendering Layouts ----------

  render: function () {
    var content = this.renderContent();

    return (
      /* jshint ignore:start */
      <div className="app">
      {content}
      </div>
      /* jshint ignore:end */
      );
  },

  renderMessagesForSelectedTeam:function(){
    return (
      /* jshint ignore:start */
      <Layout>
      <ListNavBar title={this.state.selectedGroup[0].name} actionIcon='glyphicon glyphicon-arrow-left' onNavBarAction={this.handleBack}>
      <MyGroupsPicker groups={this.state.userGroupsWithMessages} onGroupPicked={this.handleGroupChanged} />
      </ListNavBar>
      <GroupNotes groups={this.state.selectedGroup} onThreadSelected={this.handleShowConversationThread} />
      <MessageFooter messagePrompt='Type a new note here ...' btnMessage='Post' onFooterAction={this.handleStartConversation}/>
      </Layout>
      /* jshint ignore:end */
      );
  },

  renderMessagesForAllTeams:function(){
    return (
      /* jshint ignore:start */
      <Layout>
      <ListNavBar title='All Notes' actionIcon='glyphicon glyphicon-log-out' onNavBarAction={this.handleLogout}>
      <MyGroupsPicker groups={this.state.userGroupsWithMessages} onGroupPicked={this.handleGroupChanged} />
      </ListNavBar>
      <GroupNotes groups={this.state.userGroupsWithMessages} onThreadSelected={this.handleShowConversationThread} />
      </Layout>
      /* jshint ignore:end */
      );
  },

  renderMessageThread:function(){
    return (
      /* jshint ignore:start */
      <Layout>
      <ListNavBar title={this.state.selectedGroup[0].name} actionIcon='glyphicon glyphicon-arrow-left' onNavBarAction={this.handleBack} />
      <MessageItemList messages={this.state.messagesToShow} />
      <MessageFooter messagePrompt='Type a comment here ...' btnMessage='Comment' onFooterAction={this.handleAddingToConversation} />
      </Layout>
      /* jshint ignore:end */
      );
  },

  renderLoginLayout:function(){
    return (
      /* jshint ignore:start */
      <Layout>
      <Login onLoginSuccess={this.handleLoginSuccess} login={app.auth.login.bind(app.auth)}/>
      </Layout>
      /* jshint ignore:end */
      );
  },

  //render layout based on route
  renderContent:function(){
    var routeName = this.state.routeName;

    if(this.state.authenticated){

      if (routes.messagesForAllTeams === routeName) {
        return this.renderMessagesForAllTeams();
      }
      else if (routes.messagesForSelectedTeam === routeName) {
        return this.renderMessagesForSelectedTeam();
      }
      else if(routes.messageThread === routeName){
        return this.renderMessageThread();
      }
      //else if(routes.startMessageThread === routeName){
      //  return this.renderStartMessageThread();
      //}

    } else {
      return this.renderLoginLayout();
    }
  }
});

app.start = function() {
  var self = this;

  this.init(function() {

    //Make it touchable
    React.initializeTouchEvents(true);

    self.component = React.renderComponent(
      /* jshint ignore:start */
      <ClamShellApp />,
      /* jshint ignore:end */
      document.getElementById('app')
    );

    self.log('App started');
  });
};

app.init = function(callback) {
  var self = this;

  function initApi() {
    self.api.init();
    initAuth();
  }

  function initAuth() {
    //console.log('authenticating ...');
    self.auth.init(callback);
    callback();
  }

  initApi();
};

module.exports = app;