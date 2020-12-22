---
title: About
description: "About JZT, an online adventure game and homage to ZZT."
layout: page
---

About JZT
---------

JZT is an homage to [ZZT][1], a DOS-era adventure game created in 1991 by Tim Sweeney of Epic Megagames.
Like its inspiration, JZT is also a game creation platform that will allow anyone to create and share JZT game worlds.
The JZT game world editor will be available shortly.

About Mark
---------------

![large avatar][2]

My name is Mark, and I'm a software engineer living in Montréal, Canada. I started working on JZT in
February, 2013 as a way to get some hands-on experience with some of the great new web technologies.
That this experiment turned into a releaseable game was a nice surprise.

Frequently Asked Questions
--------------------------

<dl>
    {% for entry in site.data.faq %}
    <dt>{{entry.q | markdownify | remove: '<p>' | remove: '</p>'}}</dt>
    <dd>{{entry.a | markdownify | remove: '<p>' | remove: '</p>'}}</dd>
    {% endfor %}
</dl>

[1]: http://en.wikipedia.org/wiki/ZZT                                          "ZZT on Wikipedia"
[2]: http://www.gravatar.com/avatar/1a7de25727bab5a165105a633e69147d.png?s=200 "Mark"
