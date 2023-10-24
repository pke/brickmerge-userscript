// ==UserScript==
// @name           brickmerge® Prices
// @name:de        brickmerge® Preise
// @namespace      https://brickmerge.de/
// @version        1.12.0
// @license        MIT
// @description    Displays lowest brickmerge® price next to offer price
// @description:de Zeigt den bisherigen Bestpreis von brickmerge® parallel zum aktuellen Preis an
// @author         Philipp Kursawe <pke@pke.fyi>
// @match          https://www.alternate.de/LEGO/*
// @match          https://www.amazon.de/LEGO-*
// @match          https://www.jb-spielwaren.de/*
// @match          https://www.mediamarkt.de/de/product/_lego-*
// @match          https://www.mueller.de/p/lego-*
// @match          https://www.mytoys.de/lego-*
// @match          https://www.otto.de/p/lego-*
// @match          https://www.toys-for-fun.com/de/lego*
// @match          https://www.proshop.de/LEGO/*
// @match          https://steinehelden.de/*
// @match          https://www.saturn.de/de/product/_lego-*
// @match          https://www.smythstoys.com/de/de-de/spielzeug/lego/*
// @match          https://www.thalia.de/shop/home/artikeldetails/*
// @icon           https://www.google.com/s2/favicons?sz=64&domain=brickmerge.de
// @homepageURL	   https://github.com/pke/brickmerge-userscript
// @supportURL     https://github.com/pke/brickmerge-userscript/discussions
// ==/UserScript==

(function() {
    'use strict';
  
     const style = `
       .brickmerge-price, .brickmerge-price a {
         background-color: #b00 !important;
         color: #fff !important;
         padding: 0.3rem !important;
         margin: 1rem 0 !important;
       }
       .brickmerge-price a {
         font-weight: bold !important;
         text-decoration: none !important;
       }
       .brickmerge-price a:hover {
         text-decoration: underline !important;
       }
       `;
    const logo = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iRWJlbmVfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIxMTQwLjIwN3B4IiBoZWlnaHQ9IjIxMy40NTZweCIgdmlld0JveD0iMCAwIDExNDAuMjA3IDIxMy40NTYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDExNDAuMjA3IDIxMy40NTYiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxnPiA8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNODAuNDI1LDc5LjAxaDQxLjY3IE01NC4xNzEsNjIuMzMyYzAtMS4zODQtMS4xMjEtMi41MDMtMi40OTktMi41MDNIMTcuMDgzIGMtMS4zODMsMC0yLjUwMSwxLjExOS0yLjUwMSwyLjUwM3YxMi40NTJoMzkuNTg4VjYyLjMzMnogTTEyMC44NDIsNjIuMzMyYzAtMS4zODQtMS4xMTgtMi41MDMtMi41MDEtMi41MDNIODEuNjc1IGMtMS4zODQsMC0yLjUwMSwxLjExOS0yLjUwMSwyLjUwM3YxMi40NTJoNDEuNjY5VjYyLjMzMnogTTEzNC41OTYsMTU3LjgxN2MwLDAuNjg5LTAuNTU4LDEuMjU1LTEuMjUyLDEuMjU1SDEuMjUgYy0wLjY5MiwwLTEuMjUtMC41NjUtMS4yNS0xLjI1NVY4MC4yNTljMC0wLjY4OSwwLjU1OC0xLjI1LDEuMjUtMS4yNWgxMzIuMDk1YzAuNjk0LDAsMS4yNTIsMC41NjEsMS4yNTIsMS4yNVYxNTcuODE3eiIvPjwvZz48Zz4gPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTI1OS45ODEsNTUuODM0YzExLjk2NCwwLDIxLjMzLDQuNjY4LDI4LjA5OSwxNC4wMDRjNi43NjcsOS4zMzUsMTAuMTUxLDIyLjEzMSwxMC4xNTEsMzguMzg2IGMwLDE2LjczOC0zLjQ5LDI5LjY5OS0xMC40NjksMzguODg1Yy02Ljk3OSw5LjE4Ni0xNi40ODIsMTMuNzc3LTI4LjUwNiwxMy43NzdjLTExLjkwNSwwLTIxLjI0MS00LjMyLTI4LjAwNy0xMi45NjJoLTEuOTAzIGwtNC42MjMsMTEuMTQ4aC0yMS4xMTlWMTguMDM3aDI3LjY0NXYzMi44MTJjMCw0LjE2OS0wLjM2MywxMC44NDctMS4wODgsMjAuMDMxaDEuMDg4IEMyMzcuNzEzLDYwLjg1LDI0Ny4yOTIsNTUuODM0LDI1OS45ODEsNTUuODM0eiBNMjUxLjA5OSw3Ny45NWMtNi44MjksMC0xMS44MTQsMi4xMDEtMTQuOTU2LDYuMyBjLTMuMTQzLDQuMjAxLTQuNzc0LDExLjEzNC00Ljg5NSwyMC44MDJ2Mi45OTFjMCwxMC44NzYsMS42MTYsMTguNjcxLDQuODQ5LDIzLjM4NGMzLjIzMiw0LjcxNCw4LjM1Myw3LjA3LDE1LjM2Myw3LjA3IGM1LjY3OSwwLDEwLjE5Ny0yLjYxMywxMy41NTEtNy44NHM1LjAzLTEyLjgyNiw1LjAzLTIyLjc5NnMtMS42OTItMTcuNDQ4LTUuMDc2LTIyLjQzMyBDMjYxLjU4Miw4MC40NDIsMjU2Ljk1OSw3Ny45NSwyNTEuMDk5LDc3Ljk1eiIvPiA8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMzY4LjM1LDU1LjgzNGMzLjc0NiwwLDYuODU3LDAuMjcyLDkuMzM1LDAuODE2bC0yLjA4NCwyNS45MjNjLTIuMjM2LTAuNjA0LTQuOTU2LTAuOTA3LTguMTU4LTAuOTA3IGMtOC44MjMsMC0xNS42OTYsMi4yNjYtMjAuNjIsNi43OThjLTQuOTI2LDQuNTMyLTcuMzg3LDEwLjg3Ni03LjM4NywxOS4wMzR2NTEuNTc0aC0yNy42NDVWNTcuNzM3aDIwLjkzOGw0LjA3OSwxNy4wNGgxLjM1OSBjMy4xNDEtNS42NzksNy4zODctMTAuMjU2LDEyLjczNS0xMy43MzFDMzU2LjI1LDU3LjU3MiwzNjIuMDY0LDU1LjgzNCwzNjguMzUsNTUuODM0eiIvPiA8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMzg1LjYyNiwzMS41NDJjMC05LjAwMyw1LjAxNS0xMy41MDUsMTUuMDQ2LTEzLjUwNWMxMC4wMywwLDE1LjA0Niw0LjUwMiwxNS4wNDYsMTMuNTA1IGMwLDQuMjkyLTEuMjU1LDcuNjI5LTMuNzYyLDEwLjAxNmMtMi41MDgsMi4zODgtNi4yNywzLjU4MS0xMS4yODUsMy41ODFDMzkwLjY0MSw0NS4xMzksMzg1LjYyNiw0MC42MDYsMzg1LjYyNiwzMS41NDJ6IE00MTQuNDQ5LDE1OS4wNzJoLTI3LjY0NVY1Ny43MzdoMjcuNjQ1VjE1OS4wNzJ6Ii8+IDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik00NzUuMzIzLDE2MC44ODZjLTMxLjU0MywwLTQ3LjMxNC0xNy4zMTMtNDcuMzE0LTUxLjkzN2MwLTE3LjIyMiw0LjI5LTMwLjM3OCwxMi44NzEtMzkuNDc0IGM4LjU4LTkuMDk0LDIwLjg3Ny0xMy42NDEsMzYuODkxLTEzLjY0MWMxMS43MjIsMCwyMi4yMzYsMi4yOTcsMzEuNTQyLDYuODg5bC04LjE1OCwyMS4zOTFjLTQuMzUxLTEuNzUyLTguNC0zLjE4Ny0xMi4xNDYtNC4zMDUgYy0zLjc0OC0xLjExOC03LjQ5NC0xLjY3Ny0xMS4yMzktMS42NzdjLTE0LjM4MiwwLTIxLjU3MiwxMC4yMTItMjEuNTcyLDMwLjYzNmMwLDE5LjgyLDcuMTksMjkuNzI5LDIxLjU3MiwyOS43MjkgYzUuMzE2LDAsMTAuMjQyLTAuNzA5LDE0Ljc3NC0yLjEzYzQuNTMyLTEuNDE5LDkuMDY0LTMuNjQsMTMuNTk2LTYuNjYydjIzLjY1N2MtNC40NzMsMi44NDEtOC45ODksNC44MDQtMTMuNTUxLDUuODkxIEM0ODguMDI2LDE2MC4zNDEsNDgyLjI3MSwxNjAuODg2LDQ3NS4zMjMsMTYwLjg4NnoiLz4gPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTU0Ni44OTEsMTAzLjk2M2wxMi4wNTUtMTUuNDA5bDI4LjM3MS0zMC44MTdoMzEuMThsLTQwLjI0NCw0My45Nmw0Mi42OTEsNTcuMzc1aC0zMS45MDVsLTI5LjE4Ni00MS4wNiBsLTExLjg3NCw5LjUxOHYzMS41NDJoLTI3LjY0NVYxOC4wMzdoMjcuNjQ1djYyLjkwNGwtMS40NSwyMy4wMjJINTQ2Ljg5MXoiLz4gPHBhdGggZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTc1MS4yNDgsMTU5LjA3MlY5NC40NDYgYzAtOS42MDgtMS44NzQtMTYuNjE3LTUuNjItMjEuMDI4Yy0zLjc0Ny00LjQxLTkuNDg3LTYuNjE3LTE3LjIyMi02LjYxN2MtMTAuMDkyLDAtMTcuNTU0LDIuNzgtMjIuMzg4LDguMzM5IGMtNC44MzUsNS41Ni03LjI1MSwxNC4yOTItNy4yNTEsMjYuMTk1djU3LjczN2gtOS4xNTRWOTEuNzI3YzAtMTYuNjE3LTcuNjE0LTI0LjkyNi0yMi44NDItMjQuOTI2IGMtMTAuMzMyLDAtMTcuODU1LDMuMDA3LTIyLjU2OCw5LjAxOWMtNC43MTQsNi4wMTQtNy4wNywxNS42MzUtNy4wNywyOC44Njl2NTQuMzg0aC04Ljk3NFY2MC41NDdoNy40MzNsMS45MDMsMTMuNTA1aDAuNTQ0IGMyLjcyLTQuODk1LDYuNTg2LTguNjg2LDExLjYwMi0xMS4zNzVjNS4wMTYtMi42ODgsMTAuNTQ0LTQuMDM0LDE2LjU4OC00LjAzNGMxNS41MjgsMCwyNS40OTksNS44MzIsMjkuOTEsMTcuNDk0aDAuMzYzIGMzLjIwMi01LjYyLDcuNTA3LTkuOTM5LDEyLjkxNi0xMi45NjFjNS40MDctMy4wMjEsMTEuNTU3LTQuNTMyLDE4LjQ0NS00LjUzMmMxMC43NTUsMCwxOC44MjEsMi44NzEsMjQuMiw4LjYxMSBjNS4zNzgsNS43NDIsOC4wNjcsMTQuODY1LDguMDY3LDI3LjM3M3Y2NC40NDVINzUxLjI0OHoiLz4gPHBhdGggZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTgyMi41NDQsMTYwLjg4NiBjLTE0LjMyMSwwLTI1LjQ4NS00LjQxLTMzLjQ5MS0xMy4yMzRjLTguMDA4LTguODIxLTEyLjAxLTIxLjE3OC0xMi4wMS0zNy4wNzFjMC0xNS43MSwzLjg2Ni0yOC4yOTMsMTEuNjAyLTM3Ljc1MSBjNy43MzQtOS40NTYsMTguMTU4LTE0LjE4NSwzMS4yNzEtMTQuMTg1YzExLjYwMywwLDIwLjc1Nyw0LjA0OSwyNy40NjQsMTIuMTQ2YzYuNzA4LDguMDk4LDEwLjA2MiwxOS4wOTUsMTAuMDYyLDMyLjk5M3Y3LjI1MSBINzg2LjQ3YzAuMTIsMTMuNTM2LDMuMjc3LDIzLjg3LDkuNDcyLDMwLjk5OWM2LjE5Myw3LjEzMSwxNS4wNjEsMTAuNjk1LDI2LjYwMywxMC42OTVjNS42MiwwLDEwLjU2LTAuMzkzLDE0LjgxOS0xLjE3OCBjNC4yNjEtMC43ODUsOS42NTMtMi40NzgsMTYuMTgtNS4wNzZ2OC4xNTdjLTUuNTYxLDIuNDE3LTEwLjY5NSw0LjA2NC0xNS40MDksNC45NCBDODMzLjQyMSwxNjAuNDQ2LDgyOC4yMjMsMTYwLjg4Niw4MjIuNTQ0LDE2MC44ODZ6IE04MTkuOTE2LDY2LjYyYy05LjQ4NywwLTE3LjEwMSwzLjEyNy0yMi44NDEsOS4zODEgYy01Ljc0MSw2LjI1NC05LjA5NSwxNS4yNzMtMTAuMDYxLDI3LjA1Nmg2MC45MDljMC0xMS40Mi0yLjQ3OS0yMC4zNDktNy40MzMtMjYuNzg0QzgzNS41MzYsNjkuODM4LDgyOC42NzYsNjYuNjIsODE5LjkxNiw2Ni42MnoiIC8+IDxwYXRoIGZpbGw9IiNGRkZGRkYiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik05MTQuMTQ0LDU4LjY0NCBjNC4xNywwLDguNjQxLDAuNDI0LDEzLjQxNSwxLjI2OWwtMS43MjMsOC42MTFjLTQuMTA5LTEuMDI3LTguMzctMS41NDEtMTIuNzgtMS41NDFjLTguMzk5LDAtMTUuMjg4LDMuNTY2LTIwLjY2NiwxMC42OTYgYy01LjM3OCw3LjEzLTguMDY2LDE2LjEzNC04LjA2NiwyNy4wMXY1NC4zODRoLTguOTc0VjYwLjU0N2g3LjYxNGwwLjkwNiwxNy43NjVoMC42MzVjNC4wNDctNy4yNTEsOC4zNjgtMTIuMzQxLDEyLjk2MS0xNS4yNzMgQzkwMi4wNTgsNjAuMTA5LDkwNy42MTgsNTguNjQ0LDkxNC4xNDQsNTguNjQ0eiIvPiA8cGF0aCBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMTAxNS4xNyw2MC41NDd2Ni4yNTRsLTIwLjM5NCwxLjI2OSBjNS40MzgsNi43NjgsOC4xNTcsMTQuMjAxLDguMTU3LDIyLjI5N2MwLDkuNDg3LTMuMTU4LDE3LjE3Ni05LjQ3MiwyMy4wNjdjLTYuMzE0LDUuODkzLTE0Ljc5LDguODM4LTI1LjQyNCw4LjgzOCBjLTQuNDczLDAtNy42MTQtMC4xODItOS40MjctMC41NDNjLTMuNTY2LDEuODczLTYuMjg1LDQuMDc4LTguMTU4LDYuNjE2cy0yLjgxLDUuMjI4LTIuODEsOC4wNjdjMCwzLjE0MywxLjE5Miw1LjQzOCwzLjU4LDYuODg4IGMyLjM4NywxLjQ1LDYuMzkxLDIuMTc2LDEyLjAxLDIuMTc2aDE3LjIyMmMxMC42OTUsMCwxOC44ODMsMi4xNjEsMjQuNTYzLDYuNDhjNS42NzksNC4zMjEsOC41MjEsMTAuNzEsOC41MjEsMTkuMTcxIGMwLDEwLjM5Mi00LjIxNSwxOC40MTMtMTIuNjQ1LDI0LjA2NGMtOC40Myw1LjY0OS0yMC40MzksOC40NzUtMzYuMDI5LDguNDc1Yy0xMi4zODgsMC0yMS45OC0yLjM4OC0yOC43NzgtNy4xNiBjLTYuNzk4LTQuNzc0LTEwLjE5Ni0xMS40MjEtMTAuMTk2LTE5Ljk0MWMwLTYuNzY4LDIuMDk5LTEyLjM4OCw2LjI5OS0xNi44NTljNC4xOTktNC40NzEsOS44OTUtNy41MjIsMTcuMDg2LTkuMTU0IGMtMi45NjItMS4yNjktNS4zMzQtMy4wNjYtNy4xMTUtNS4zOTNjLTEuNzgzLTIuMzI2LTIuNjc0LTUtMi42NzQtOC4wMjFjMC02LjU4Niw0LjE5OS0xMi4zODcsMTIuNTk5LTE3LjQwMiBjLTUuNzQxLTIuMzU3LTEwLjIxMi02LjA1OS0xMy40MTQtMTEuMTA0Yy0zLjIwNC01LjA0NC00LjgwNS0xMC44MzItNC44MDUtMTcuMzU3YzAtOS44NDksMy4xMjctMTcuNzUsOS4zODItMjMuNzAyIGM2LjI1NC01Ljk1MSwxNC42OTctOC45MjgsMjUuMzMzLTguOTI4YzYuNDY2LDAsMTEuNDgsMC42MzUsMTUuMDQ3LDEuOTA0SDEwMTUuMTd6IE05MzUuNDA4LDE3NS43NSBjMCwxMy41MzUsMTAuMDYyLDIwLjMwMywzMC4xODQsMjAuMzAzYzI1Ljg2MSwwLDM4Ljc5My04LjI0OCwzOC43OTMtMjQuNzQ0YzAtNS45MjMtMi4wMjUtMTAuMjEyLTYuMDcyLTEyLjg3IGMtNC4wNS0yLjY1OS0xMC42MDUtMy45ODgtMTkuNjY5LTMuOTg4aC0xNi4xMzRDOTQ0LjQ0MSwxNTQuNDUsOTM1LjQwOCwxNjEuNTUsOTM1LjQwOCwxNzUuNzV6IE05NDIuOTMxLDkxLjI3NCBjMCw3LjYxNCwyLjMxMiwxMy41MjEsNi45MzQsMTcuNzJjNC42MjMsNC4yLDEwLjgwMSw2LjMsMTguNTM2LDYuM2M4LjIxNywwLDE0LjUxNy0yLjA4NiwxOC44OTgtNi4yNTUgYzQuMzgtNC4xNjksNi41NzEtMTAuMjExLDYuNTcxLTE4LjEyN2MwLTguMzk4LTIuMjUyLTE0LjY5OC02Ljc1My0xOC44OThjLTQuNTAyLTQuMTk5LTEwLjgwMi02LjMtMTguODk4LTYuMyBjLTcuODU1LDAtMTQuMDM1LDIuMjUyLTE4LjUzNSw2Ljc1M0M5NDUuMTgxLDc2Ljk2OCw5NDIuOTMxLDgzLjIzOCw5NDIuOTMxLDkxLjI3NHoiLz4gPHBhdGggZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTEwNjUuODkzLDE2MC44ODYgYy0xNC4zMjEsMC0yNS40ODUtNC40MS0zMy40OTEtMTMuMjM0Yy04LjAwOC04LjgyMS0xMi4wMS0yMS4xNzgtMTIuMDEtMzcuMDcxYzAtMTUuNzEsMy44NjYtMjguMjkzLDExLjYwMi0zNy43NTEgYzcuNzM0LTkuNDU2LDE4LjE1OC0xNC4xODUsMzEuMjcxLTE0LjE4NWMxMS42MDMsMCwyMC43NTcsNC4wNDksMjcuNDY0LDEyLjE0NmM2LjcwOCw4LjA5OCwxMC4wNjIsMTkuMDk1LDEwLjA2MiwzMi45OTN2Ny4yNTEgaC03MC45NzFjMC4xMiwxMy41MzYsMy4yNzcsMjMuODcsOS40NzIsMzAuOTk5YzYuMTkzLDcuMTMxLDE1LjA2MSwxMC42OTUsMjYuNjAzLDEwLjY5NWM1LjYyLDAsMTAuNTYtMC4zOTMsMTQuODE5LTEuMTc4IGM0LjI2MS0wLjc4NSw5LjY1My0yLjQ3OCwxNi4xOC01LjA3NnY4LjE1N2MtNS41NjEsMi40MTctMTAuNjk1LDQuMDY0LTE1LjQwOSw0Ljk0IEMxMDc2Ljc3LDE2MC40NDYsMTA3MS41NzIsMTYwLjg4NiwxMDY1Ljg5MywxNjAuODg2eiBNMTA2My4yNjQsNjYuNjJjLTkuNDg3LDAtMTcuMTAxLDMuMTI3LTIyLjg0MSw5LjM4MSBjLTUuNzQxLDYuMjU0LTkuMDk1LDE1LjI3My0xMC4wNjEsMjcuMDU2aDYwLjkwOWMwLTExLjQyLTIuNDc5LTIwLjM0OS03LjQzMy0yNi43ODQgQzEwNzguODg0LDY5LjgzOCwxMDcyLjAyNiw2Ni42MiwxMDYzLjI2NCw2Ni42MnoiLz48L2c+PGc+IDxwYXRoIGZpbGw9IiNGRkZGRkYiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMTEwMC44MDMsMzguNjZjMC0zLjQ5MywwLjg3My02Ljc2OSwyLjYyLTkuODI1IGMxLjc0Ni0zLjA1Nyw0LjE0OC01LjQ2Nyw3LjIwNS03LjIzMWMzLjA1Ny0xLjc2NCw2LjM1LTIuNjQ2LDkuODc4LTIuNjQ2YzMuNDkzLDAsNi43NjksMC44NzQsOS44MjUsMi42MiBjMy4wNTcsMS43NDcsNS40NjcsNC4xNDksNy4yMzEsNy4yMDZjMS43NjQsMy4wNTcsMi42NDYsNi4zNSwyLjY0Niw5Ljg3N2MwLDMuNDQxLTAuODQ4LDYuNjczLTIuNTQyLDkuNjk0IGMtMS42OTQsMy4wMjItNC4wNyw1LjQ0MS03LjEyNiw3LjI1OGMtMy4wNTgsMS44MTctNi40MDIsMi43MjUtMTAuMDM1LDIuNzI1Yy0zLjYxNiwwLTYuOTUyLTAuOTA0LTEwLjAwOS0yLjcxMiBjLTMuMDU3LTEuODA4LTUuNDM3LTQuMjIyLTcuMTQtNy4yNDRTMTEwMC44MDMsNDIuMTE5LDExMDAuODAzLDM4LjY2eiBNMTEwMy4yNCwzOC42NmMwLDMuMTA5LDAuNzczLDUuOTg3LDIuMzE5LDguNjMzIGMxLjU0NSwyLjY0NiwzLjY0Niw0Ljc0Nyw2LjMwMSw2LjMwMXM1LjUzNywyLjMzMiw4LjY0NiwyLjMzMmMzLjEwOCwwLDUuOTg2LTAuNzczLDguNjMzLTIuMzE5czQuNzQ2LTMuNjQ2LDYuMzAyLTYuMzAxIGMxLjU1NC0yLjY1NSwyLjMzMS01LjUzNywyLjMzMS04LjY0NmMwLTMuMDM5LTAuNzQ2LTUuODc3LTIuMjM5LTguNTE1Yy0xLjQ5NC0yLjYzNy0zLjU4MS00Ljc2LTYuMjYzLTYuMzY3IHMtNS42MDMtMi40MTEtOC43NjQtMi40MTFjLTMuMDc0LDAtNS45NDMsMC43NzMtOC42MDcsMi4zMTlzLTQuNzcyLDMuNjY0LTYuMzI3LDYuMzU0IEMxMTA0LjAxNywzMi43MywxMTAzLjI0LDM1LjYwNCwxMTAzLjI0LDM4LjY2eiBNMTEyNy41MjgsMzMuNzYxYzAsMS4zOC0wLjMzNiwyLjU5OC0xLjAwOSwzLjY1NSBjLTAuNjczLDEuMDU3LTEuNjM4LDEuODgyLTIuODk1LDIuNDc2bDYuMjA5LDEwLjI5N2gtMy4xN2wtNS41MDItOS40MzJoLTQuNDAydjkuNDMyaC0yLjY0NlYyNy4xMzJoNS41MjggYzIuNDk4LDAsNC40MzcsMC41NDIsNS44MTcsMS42MjVDMTEyNi44MzcsMjkuODM5LDExMjcuNTI4LDMxLjUwNywxMTI3LjUyOCwzMy43NjF6IE0xMTE2Ljc1OSwzOC42NmgyLjkzNSBjMS41ODksMCwyLjgzOC0wLjQwNiwzLjc0Ny0xLjIxOGMwLjkwOC0wLjgxMiwxLjM2Mi0xLjk5NSwxLjM2Mi0zLjU1YzAtMy4wMDQtMS43MjEtNC41MDYtNS4xNjItNC41MDZoLTIuODgyVjM4LjY2eiIvPjwvZz48L3N2Zz4="/>`;
  
    const resolvers = {
        "www.amazon.de": {
            articleSelector: "#productTitle",
            targetSelector: "#corePriceDisplay_desktop_feature_div,#corePrice_feature_div",
            testURL: "https://www.amazon.de/LEGO-43230-Disney-Kamera-Maus-Minifiguren/dp/B0BV7BMPVS",
        },
        "www.mytoys.de": {
            articleSelector: ".prod-info__name",
            targetSelector: ".prod-info__price-container",
            testURL: "https://www.mytoys.de/lego-lego-disney-43230-kamera--hommage-an-walt-disney-29981540.html",
        },
        "www.smythstoys.com": {
            articleSelector: "h1[itemprop=name]",
            targetSelector: "#product-info div[itemprop=price]",
            testURL: "https://www.smythstoys.com/de/de-de/spielzeug/lego/lego-fuer-erwachsene/lego-icons-set-10266-nasa-apollo-11-mondlandefaehre/p/183613",
        },
        "www.toys-for-fun.com": {
            articleSelector: "h1.page-title span[itemprop=name]",
            targetSelector: ".product-info-price",
            testURL: "https://www.toys-for-fun.com/de/legor-disney-43230-kamera-hommage-an-walt-disney.html",
        },
        "www.jb-spielwaren.de": {
            articleSelector: "h1",
            targetSelector: ".widget-availability",
            testURL: "https://www.jb-spielwaren.de/lego-10293-besuch-des-weihnachtsmanns/a-10293/",
        },
        "steinehelden.de": {
            articleSelector: "h1[itemprop=name]",
            targetSelector: "div[itemprop=offers] .product--tax",
            testURL: "https://steinehelden.de/city-arktis-schneemobil-60376/",
        },
        "www.proshop.de": {
            articleSelector: "h1[data-type=product]",
            targetSelector: "#site-product-price-stock-buy-container span.site-currency-wrapper",
            testURL: "https://www.proshop.de/LEGO/LEGO-Ideas-21343-Wikingerdorf/3195765",
        },
        "www.alternate.de": {
          targetSelector: "#product-top-right .vat-and-shipping-costs",
          testURL: "https://www.alternate.de/LEGO/10311-Creator-Expert-Orchidee-Konstruktionsspielzeug/html/product/1818749",
        },
        "www.saturn.de": {
          targetSelector: "div[data-test='mms-pdp-offer-selection']",
          prepend: true,
          dynamic: true, // Site changes its DOM via script and could remove our element
          styleSelector: "div[data-test='mms-branded-price'] p > span",
          style(element) {
              element.querySelector("a").style = "text-decoration: underline";
              element.style = "text-align: right";
          },
          testURL: "https://www.saturn.de/de/product/_lego-10281-bonsai-baum-2672008.html",
        },
        "www.mediamarkt.de": "www.saturn.de", // just an alias, same as saturn
        "www.otto.de": {
          targetSelector: ".pdp_price__inner",
          prepend: true,
          testURL: "https://www.otto.de/p/lego-konstruktionsspielsteine-kamera-hommage-an-walt-disney-43230-lego-disney-811-st-made-in-europe-C1725197870/#variationId=1725014125",
        },
        "www.mueller.de": {
          targetSelector: ".mu-product-price.mu-product-details-page__price",
          testURL: "https://www.mueller.de/p/lego-icons-10281-bonsai-baum-kunstpflanzen-set-fuer-erwachsene-deko-2681620/",
        },
        "www.thalia.de": {
          targetSelector: "artikel-informationen",
          style(element) {
              element.classList.add("element-text-small");
          },
          testURL: "https://www.thalia.de/shop/home/artikeldetails/A1068002914",
        },
    };
  
    function renderError(element, error, operation = "append") {
        if (!element) {
            return;
        }
        const errorElement = document.createElement("div");
        errorElement.innerText = error.message;
        element[operation]?.(errorElement);
    }
  
    function addLowestPrice(element, url, lowestPrice, operation = "append") {
        if (!element) {
            return;
        }
        let brickmergeBox = element.querySelector(".brickmerge-price");
        let isNew = !brickmergeBox;
        console.log("addLowestPrice isNew: ", isNew);
        if (!brickmergeBox) {
            brickmergeBox = document.createElement("div");
            brickmergeBox.className = "brickmerge-price";
        }
        const brickmergeLink = url ? `<a href="${url}">${lowestPrice}</a>` : "...";
        brickmergeBox.innerHTML = `<strong>brick</strong>merge® Bestpreis: ${brickmergeLink}`;
        if (isNew) {
            element[operation]?.(brickmergeBox);
        }
        return brickmergeBox;
    }
  
    function addPriceToTargets(resolver, priceOrError, url, styleClasses) {
        const targets = document.querySelectorAll(resolver.targetSelector);
        if (targets.length === 0) {
            return;
        }
        if (!document.querySelector("head style.brickmerge")) {
            const styleElement = document.createElement("style");
            styleElement.className = "brickmerge";
            styleElement.type = 'text/css';
            styleElement.innerHTML = style;
            document.head.appendChild(styleElement);
        }
        const error = priceOrError instanceof Error && priceOrError
        const price = error ? undefined : priceOrError
        if (error instanceof Error) {
            for (let element of targets) {
                renderError(element, error, resolver.prepend ? "prepend" : "append");
            }
        } else if (price) {
            for (let element of targets) {
                //console.log("target:", element.innerHTML);
                const box = addLowestPrice(element, url, price, resolver.prepend ? "prepend" : "append");
                if (styleClasses) {
                    box.className = styleClasses;
                }
                if (typeof resolver.style === "function") {
                    resolver.style(box);
                } else if (typeof resolver.style === "string") {
                    box.style = resolver.style;
                }
            }
        }
    }
  
    let resolver = resolvers[document.location.host]
    // Do we have an alias for another resolver?
    if (typeof resolver === "string") {
        resolver = resolvers[resolver];
    }
    if (!resolver) {
        return;
    }
  
    // Fetch the LEGO set number from the title
    const title = resolver.articleSelector && document.querySelector(resolver.articleSelector)?.textContent || document.title;
    //console.log("title: ", title);
    const [, setNumber] = /(\d+)/.exec(title) || [];
    //console.log("set number: ", setNumber);
  
    const styleNode = document.querySelector(resolver.styleSelector);
    console.log("styleNode", styleNode);
    const styleClasses = styleNode?.className;
  
    if (setNumber) {
        if (!resolver.dynamic) {
            addPriceToTargets(resolver, "...", "", styleClasses);
        }
        fetch(`https://www.brickmerge.de/_app.php?find=${setNumber}&json_token=zNrPtJiFeOoOLpDjAMctsNzOrvi8KipF`)
        .then(res => res.json(), () => ({ error: "brickmerge® nicht erreichbar" }))
        .then(({ offers, error, url }) => {
            //console.log("offers", offers);
            if (!offers && !error) {
                return;
            }
            const lowestPrice = Number(offers?.lowPrice).toLocaleString("de-DE", {style: "currency", currency: offers?.priceCurrency || "EUR" });
            addPriceToTargets(resolver, error || lowestPrice, url, styleClasses);
        });
    }
  })();