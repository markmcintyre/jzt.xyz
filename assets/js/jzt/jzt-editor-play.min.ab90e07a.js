/* 
 * JZT — A DOS-Era Adventure Game for the Web
 * Copyright © 2023 Mark McIntyre
 * Created by Mark McIntyre
 * All rights reserved.
 * 
 * Version : 1.0.59
 * Released: 2023-02-05
 */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).jztPlayer=e()}}(function(){return function(){return function e(n,t,o){function i(a,f){if(!t[a]){if(!n[a]){var d="function"==typeof require&&require;if(!f&&d)return d(a,!0);if(r)return r(a,!0);var u=new Error("Cannot find module '"+a+"'");throw u.code="MODULE_NOT_FOUND",u}var l=t[a]={exports:{}};n[a][0].call(l.exports,function(e){return i(n[a][1][e]||e)},l,l.exports,e,n,t,o)}return t[a].exports}for(var r="function"==typeof require&&require,a=0;a<o.length;a++)i(o[a]);return i}}()({1:[function(e,n,t){"use strict";var o;function i(e){var n=document.querySelector("button");e.origin===o&&e.data&&e.data.lastIndexOf&&0===e.data.lastIndexOf("play-game:",0)&&(n.innerText="Click to play",n.addEventListener("click",function(){n.remove(),new jzt.Game({canvasElement:document.getElementById("jzt"),playTest:!0,onLoadCallback:function(n){n&&this.run(JSON.parse(e.data.substring(10)))}})}))}o=window.location.origin||window.location.protocol+"//"+window.location.host,window.addEventListener("message",i,!1),window.opener.postMessage("send-game",o)},{}]},{},[1])(1)});
