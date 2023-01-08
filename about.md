---
title: About
description: "About JZT, an online adventure game and homage to ZZT."
layout: page
---

About JZT
=========

JZT is a <del>ripoff of</del> uh, I mean a <em>heavily-inspired homage</em> to [ZZT][1], a DOS-era adventure game created in 1991 by the legendary Tim Sweeney of Epic Megagames.

Like its inspiration, JZT is also a game creation platform that lets anyone to create their own JZT worlds. Unlike its inspiration, it runs in a web browser so you don't have to download or install anything. Neat!

About Mark
==========
<figure class="left">
    <img src="/assets/img/avatar.jpg" alt="avatar" />
    <figcaption>Hey there! 👋🏻<br/>My name is Mark. I'm a computer scientist and tinkerer living in Montréal, Canada. You can reach me on <a rel="me" href="https://mstdn.ca/@markmcintyre">Mastodon</a>.</figcaption>
</figure>

Frequently Asked Questions
==========================

<dl>
    {% for entry in site.data.faq %}
    <dt>{{entry.q | markdownify | remove: '<p>' | remove: '</p>'}}</dt>
    <dd>{{entry.a | markdownify | remove: '<p>' | remove: '</p>'}}</dd>
    {% endfor %}
</dl>

[1]: http://en.wikipedia.org/wiki/ZZT                                          "ZZT on Wikipedia"
[2]: /assets/img/avatar.jpg                 "Hi."
