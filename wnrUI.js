/**
 * Copyright 2015 Urbiworx
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
var express=require("express");
var fs=require("fs");
module.exports = function(RED) {
    "use strict";
	var userDir="";
	if (RED.settings.userDir){
		userDir=RED.settings.userDir+"/";
	} 

	var dstemplate;
	var dslib;
	var pendingresponses=new Array();

	var nodes=new Array();
    function Freeboard(n) {
        RED.nodes.createNode(this,n);
        this.name = n.name.trim();
		nodes.push(this);
        var that = this;
        this.on("input", function(msg) {
			that.lastValue=msg.payload;
        });
		this.on("close",function() {
			var index = nodes.indexOf(that);
			if (index > -1) {
				nodes.splice(index, 1);
			}
		});
    }

	RED.httpNode.use("/wnrUI",express.static(__dirname + '/wnrUI'));
    RED.nodes.registerType("wnrUI",Freeboard);
}