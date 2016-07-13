/*globals svgEditor, $, DOMParser*/
/*jslint es5: true, vars: true, eqeq: true*/
/*
 * ext-compass.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Christian Tzurcanu
 * Copyright(c) 2010 Alexis Deveria
 *
 */

svgEditor.addExtension('compass', function() {'use strict';
	var current_d, cur_shape_id;
	var canv = svgEditor.canvas;
	var cur_shape;
	var start_x, start_y;
	var svgroot = canv.getRootElem();
	var lastBBox = {};
	var clickButton_id = "compass";

	// This populates the category list
	var categories = {
		compass: 'Compass'
	};

	var library = {
		basic: {
			data: {
				"compass1": "M285.371,324.397l-29.544,145.033L226.82,324.397L82.325,294.854l144.495-29.007l29.006-145.571l29.544,145.571l145.032,29.544L285.371,324.397z M95.217,295.391l133.752,27.395l26.857-27.395H95.217z M224.135,39.164h14.503l37.601,44.584V48.833c0-1.788-0.185-3.307-0.537-4.566c-0.361-1.25-0.898-2.056-1.611-2.417c-0.722-1.075-2.333-1.612-4.834-1.612h-0.537v-1.074h19.337v1.074h-1.611c-2.871,0-4.834,0.722-5.909,2.149v54.791h-1.611l-39.212-45.122v34.378c0,4.658,0.176,7.167,0.537,7.52c1.074,1.075,2.686,1.612,4.834,1.612h2.686v1.074h-20.412v-1.074h1.612c1.427,0,2.593-0.269,3.491-0.806c0.89-0.538,1.695-0.982,2.417-1.343c0.353-0.713,0.537-3.039,0.537-6.983v-39.75c-0.361,0-0.722-0.176-1.074-0.537c-1.796-1.427-2.955-2.417-3.492-2.955s-1.704-0.982-3.492-1.343c-0.361-0.713-1.435-1.075-3.223-1.075V39.164z M255.827,133.167l-26.857,133.753l26.857,28.47V133.167z M283.222,266.921l-27.396,28.47h161.147L283.222,266.921z M255.827,295.391v160.611l27.396-133.216L255.827,295.391z",
				"compass2": "M261.64,331.354l-86.482,29.007l5.909-18.264l-18.264,5.909l87.02-263.209l7.52,23.098h0.538l3.223-11.281L348.66,360.36L261.64,331.354z M249.823,90.167l-84.334,255.152l84.334-27.933l83.796,27.933L249.823,90.167z M280.978,460.81l-44.047-65.534v65.534h-10.743v-84.872h11.817l44.047,65.534v-65.534h10.743v84.872H280.978z",
				"compass3": "M265.248,382.628l-87.557,57.476l87.557-263.746h0.537l89.168,263.746L265.248,382.628z M230.87,70h16.114l41.361,48.882V80.743c0-3.575-0.722-6.085-2.148-7.52c-0.722-0.713-1.343-1.25-1.88-1.612c-0.537-0.352-1.704-0.537-3.492-0.537h-1.074V70h21.486v1.074h-2.148c-3.223,0-5.372,1.075-6.446,3.223v59.625h-2.148l-42.436-49.956v38.139c0,5.019,0.353,7.881,1.075,8.594c0.713,0.722,2.501,1.075,5.372,1.075h2.148v1.074h-21.486v-1.074h1.074c2.862,0,5.011-0.713,6.446-2.149c0.713-0.713,1.074-3.223,1.074-7.52v-43.51c-2.148-1.788-3.676-2.954-4.566-3.492c-0.898-0.537-2.241-1.158-4.029-1.88c-0.722-0.713-2.148-1.074-4.297-1.074V70z",
				"compass4": "M255.733,342.878l-81.111,97.226l81.111-275.563l81.647,275.563L255.733,342.878z M224.578,61.943h12.892l41.898,62.848V61.943h10.743v81.648h-10.743l-44.584-66.071v66.071h-10.206V61.943z M255.733,190.861v139.662l60.161,70.905L255.733,190.861z",
				"compass5": "M112.829,221.452l-17.189,64.459H85.97L73.079,237.03c-0.722-4.297-1.259-6.983-1.611-8.057c-0.361,1.796-0.722,3.407-1.074,4.834c-0.361,1.436-0.722,2.51-1.074,3.223L55.89,285.912h-8.594l-17.727-64.459h8.595l12.892,55.328c0.714-3.223,1.427-5.724,2.149-7.52c0.713-1.788,1.25-3.039,1.611-3.76l11.28-44.047h11.28l8.594,32.767c1.075,3.945,1.964,7.881,2.686,11.818c0.713,3.945,1.427,7.52,2.149,10.743c0.713-2.149,1.25-4.297,1.611-6.446c0.353-2.148,0.89-4.65,1.611-7.521l10.206-41.361H112.829z M400.745,257.442l-110.654,29.544l-30.081,109.581l-29.544-109.581l-111.729-29.544l111.729-29.544l29.544-110.655l30.081,110.655L400.745,257.442z M257.861,255.831l-24.709-24.709l-92.391,24.709H257.861z M280.959,107.037h-9.669l-32.767-49.956v49.956h-8.058V42.577h8.595l33.841,51.03v-51.03h8.058V107.037z M281.496,428.797h-8.058c-2.148-7.873-7.344-11.818-15.577-11.818c-5.372,0-9.132,1.075-11.28,3.223c-2.149,2.148-3.223,4.482-3.223,6.983c0,2.149,0.713,3.945,2.149,5.372c0.713,0.722,2.232,1.436,4.565,2.148c2.325,0.722,4.918,1.436,7.789,2.149c2.862,0.722,5.64,1.528,8.326,2.417c2.686,0.898,4.566,1.704,5.64,2.417c7.521,2.871,11.28,8.058,11.28,15.578c0,5.019-2.148,9.4-6.446,13.161c-4.297,3.76-10.03,5.64-17.189,5.64c-8.242,0-14.772-1.88-19.606-5.64c-4.834-3.76-7.251-9.577-7.251-17.458h8.594c1.075,10.391,7.16,15.578,18.264,15.578c4.297,0,7.965-1.158,11.012-3.492c3.038-2.325,4.565-4.918,4.565-7.789c0-3.936-2.686-6.798-8.057-8.594c-0.722-0.353-2.148-0.806-4.297-1.343c-2.148-0.537-4.481-1.074-6.983-1.611c-2.509-0.537-4.834-1.158-6.983-1.88c-2.148-0.713-3.76-1.427-4.834-2.148c-6.093-3.575-9.131-8.233-9.131-13.966c0-5.372,1.964-9.753,5.908-13.161c3.937-3.399,9.484-5.103,16.652-5.103c7.159,0,12.799,1.796,16.92,5.371C278.357,418.414,280.774,423.072,281.496,428.797z M259.472,375.618V257.979l-25.783,26.857L259.472,375.618z M285.256,230.584l-24.709-91.854v116.564L285.256,230.584z M383.018,257.442H261.084l25.246,26.321L383.018,257.442z M458.758,286.449H410.95v-64.459h46.196v7.521h-37.602v19.875h35.453v7.52h-35.453v21.487h39.213V286.449z",
				"compass6": "M83.574,276.885l-9.132-34.378h4.297l5.372,23.098c0.713,2.87,1.25,5.195,1.611,6.983c1.074-3.576,1.611-5.725,1.611-6.446l6.983-23.635h6.445c3.223,10.743,5.372,17.911,6.446,21.486c1.074,3.584,1.787,6.446,2.148,8.595c0.353-1.075,0.89-3.399,1.611-6.983l5.372-23.098h4.834l-9.669,34.378h-4.834l-9.132-30.081c0,0.361-0.185,0.898-0.537,1.611c-0.361,0.722-0.806,2.065-1.343,4.029c-0.537,1.972-1.343,4.834-2.418,8.594c-1.074,3.76-2.509,9.048-4.297,15.846H83.574z M246.332,325.229c-12.539-3.223-23.458-9.577-32.767-19.069c-9.316-9.484-15.401-20.496-18.263-33.035l-67.682-14.504l67.682-16.114c2.861-12.531,8.946-23.367,18.263-32.499c9.309-9.132,20.228-15.125,32.767-17.995l15.041-64.997l14.503,64.459c13.244,2.871,24.709,8.956,34.378,18.264c9.669,9.316,15.93,20.412,18.801,33.304l63.921,15.577l-63.921,13.967c-2.871,13.252-9.048,24.709-18.532,34.378c-9.492,9.669-20.865,15.938-34.109,18.801l-15.04,64.459L246.332,325.229z M193.69,258.621c0-1.788,0-3.575,0-5.371c0-2.149,0.177-4.113,0.538-5.909l-48.882,11.28H193.69z M204.433,258.084c0,7.881,1.612,15.31,4.835,22.292s7.521,13.161,12.892,18.532c5.372,5.372,11.549,9.585,18.532,12.624c6.982,3.047,14.41,4.566,22.292,4.566c7.52,0,14.68-1.519,21.486-4.566c6.798-3.039,12.892-7.251,18.263-12.624c5.372-5.371,9.577-11.549,12.623-18.532c3.039-6.983,4.566-14.411,4.566-22.292c0-7.52-1.527-14.771-4.566-21.755c-3.046-6.983-7.251-13.16-12.623-18.532c-5.371-5.371-11.549-9.669-18.531-12.892c-6.983-3.223-14.235-4.834-21.755-4.834c-7.882,0-15.31,1.611-22.292,4.834c-6.983,3.223-13.161,7.521-18.532,12.892c-5.371,5.372-9.585,11.549-12.623,18.532C205.953,243.313,204.433,250.564,204.433,258.084z M270.504,107.142l-17.726-26.858v26.858h-5.372V71.689h5.372l17.188,26.321V71.689h5.909v35.453H270.504z M252.241,433.199c0,5.371,3.223,8.057,9.669,8.057c5.724,0,8.594-1.788,8.594-5.372c0-1.788-1.259-3.399-3.76-4.834c-1.074-0.353-3.223-0.89-6.446-1.611c-3.223-0.713-5.371-1.427-6.445-2.149c-3.223-1.427-4.835-3.937-4.835-7.52c0-2.862,1.075-5.187,3.224-6.983c2.148-1.788,5.011-2.686,8.595-2.686c3.936,0,6.982,0.99,9.131,2.955c2.149,1.972,3.576,4.39,4.298,7.251h-4.298c-0.722-3.937-3.584-5.909-8.594-5.909c-5.372,0-8.058,1.796-8.058,5.372c0,1.074,0.353,1.972,1.074,2.686c1.074,1.074,3.491,1.972,7.252,2.686c3.76,0.722,6.177,1.436,7.251,2.148c3.937,1.436,5.909,4.121,5.909,8.058c0,3.584-1.167,6.177-3.492,7.789c-2.333,1.611-5.464,2.417-9.399,2.417c-9.316,0-13.967-4.112-13.967-12.354H252.241z M261.373,326.841c-1.797,0-3.408,0-4.835,0c-1.436,0-3.047-0.176-4.834-0.537l9.669,46.196V326.841z M270.504,190.402l-9.131-45.659v45.122L270.504,190.402z M330.129,267.216l45.121-8.595h-44.584L330.129,267.216z M410.702,277.422v-34.915h25.783v4.297h-20.411v10.206h18.8v4.297h-18.8v11.818h21.485v4.297H410.702z",
				"compass7": "M76.417,244.55v0.537c-1.074,0-1.797,0.185-2.148,0.538c-0.361,0.361-0.723,0.722-1.075,1.074c-0.36,0.361-0.897,1.972-1.611,4.834l-9.669,24.709h-0.537l-6.982-18.801l-5.909,18.801h-1.611l-9.132-25.784c-0.722-1.427-1.259-2.501-1.611-3.223c-0.361-1.427-1.436-2.149-3.223-2.149v-0.537h11.279v0.537h-0.537c-1.435,0-2.148,0.722-2.148,2.149c0,0.361,0.354,1.612,1.074,3.76l5.909,17.727l4.835-14.504c-1.797-3.936-2.871-6.261-3.224-6.983c-0.36-0.713-1.435-1.427-3.223-2.149v-0.537h12.354v0.537h-1.074c-1.436,0-2.148,0.722-2.148,2.149c0,0.722,0.352,2.149,1.074,4.297l5.908,17.189l6.446-17.189l1.074-4.297c0-1.074-0.537-1.611-1.611-1.611c-0.361-0.353-1.075-0.538-2.149-0.538v-0.537H76.417z M428.791,262.276l-113.34,30.081l27.933,54.791l-2.148,2.149l-55.328-28.47l-29.006,114.416h-2.686l-28.47-114.416l-55.864,28.47l-1.611-2.149l27.395-54.791L81.788,262.276v-2.148l113.877-27.933l-27.932-55.865l3.223-2.686l54.79,27.933l28.47-113.878h2.686l28.469,113.878l55.865-27.933l2.148,1.611l-27.933,56.939l113.34,27.933V262.276z M198.35,233.27l-107.969,28.47H255.29L198.35,233.27z M225.746,204.263l-52.104-25.246l81.648,82.723L225.746,204.263z M199.424,290.746l-25.783,52.104l81.648-81.111L199.424,290.746z M227.894,317.604l27.396,109.044V261.739L227.894,317.604z M238.1,45.8h8.057l20.412,24.172V51.172c0-1.788-0.36-3.038-1.074-3.76c-0.721-0.713-1.611-1.074-2.686-1.074h-0.537V45.8h10.743v0.537h-1.074c-1.796,0-2.87,0.537-3.223,1.611v29.544h-1.075l-20.948-24.709v18.801c0,2.51,0.177,3.945,0.537,4.297c0.353,0.361,1.251,0.537,2.686,0.537h1.074v0.537h-10.743v-0.537h0.537c1.428,0,2.502-0.353,3.223-1.074c0.354-0.353,0.537-1.612,0.537-3.76V50.098c-2.148-1.427-3.584-2.325-4.297-2.686c-0.361-0.353-1.074-0.537-2.148-0.537V45.8z M264.958,443.837v10.743h-0.537c-0.721-2.501-1.796-4.649-3.223-6.445c-1.436-1.788-3.408-2.686-5.908-2.686c-1.797,0-3.14,0.537-4.029,1.611c-0.898,1.075-1.343,2.149-1.343,3.223c0,1.435,0.177,2.333,0.537,2.686c1.427,1.436,3.761,3.047,6.983,4.835c3.936,1.796,6.529,3.407,7.789,4.834c1.25,1.436,1.879,3.223,1.879,5.372c0,2.148-0.99,4.028-2.953,5.64c-1.973,1.612-4.391,2.417-7.252,2.417h-2.686c-0.361,0-1.344-0.269-2.955-0.806c-1.611-0.538-2.602-0.806-2.954-0.806c-0.722,0-1.074,0.538-1.074,1.612h-0.537v-10.743h0.537c1.074,6.093,4.112,9.131,9.132,9.131c4.649,0,6.982-1.611,6.982-4.834c0-1.074-1.074-2.501-3.223-4.297c-0.361-0.353-1.973-1.343-4.834-2.955c-2.871-1.611-4.835-2.77-5.909-3.491c-2.148-2.149-3.224-4.298-3.224-6.446s0.807-4.112,2.418-5.909c1.611-1.788,3.844-2.686,6.715-2.686c1.787,0,3.575,0.537,5.371,1.612h1.611c1.074,0,1.788-0.537,2.148-1.612H264.958z M282.684,204.263L255.29,96.831v164.909L282.684,204.263z M255.29,261.739l1.074-0.537l30.08,56.939l50.493,25.783L255.29,261.739z M255.29,261.739l58.013,28.47l107.968-28.47H255.29z M314.377,230.584l24.172-52.642l-81.11,83.26L314.377,230.584z M443.294,247.773v12.355h7.521c1.788,0,2.862-0.176,3.224-0.537c0.352-0.353,0.889-1.611,1.611-3.76h0.537v10.206h-0.537c-0.361-0.713-0.537-1.25-0.537-1.612c0-0.353-0.186-0.713-0.537-1.074c0-1.074-1.26-1.611-3.761-1.611h-7.521v8.058c0,2.87,0.084,4.565,0.27,5.103c0.176,0.538,0.981,0.806,2.416,0.806h5.372c3.224,0,5.372-0.538,6.446-1.612s2.148-2.686,3.223-4.834h1.074l-3.223,8.057H434.7v-0.537h0.537c1.074,0,1.787-0.176,2.148-0.537c1.074,0,1.611-1.427,1.611-4.297v-20.412c0-1.788-0.361-3.038-1.074-3.76c-0.722-0.713-1.611-1.074-2.686-1.074H434.7v-0.537h24.172l0.537,6.983h-1.074c-0.723-2.501-1.797-4.112-3.223-4.834c-0.361-0.353-1.436-0.538-3.223-0.538H443.294z",
				"compass8": "M326.476,277.073l-59.902,72.991v110.745h-17.115V350.568l-62.419-70.977l62.419-75.005v-66.447l-32.216,20.639l40.271-95.14l42.284,95.14l-33.224-20.639v70.474L326.476,277.073z M298.791,249.388h-15.605l-12.081,42.284l-20.639-42.284h-16.107l-16.612,62.419h15.605l9.563-42.285l23.659,42.285h15.604L298.791,249.388z",
				"compass9": "M50.613,254.889c-0.722-1.074-1.435-1.611-2.149-1.611v-1.074h9.669v1.074c-1.435,0-2.148,0.269-2.148,0.806s0.353,1.88,1.074,4.029l6.446,15.578l8.057-21.486h0.537l9.132,20.949l2.686-5.909c2.148-5.724,3.223-9.308,3.223-10.743c0-1.074-0.361-1.964-1.074-2.686c-0.361-0.353-0.898-0.537-1.611-0.537v-1.074h9.131v1.074c-1.796,0-3.223,0.898-4.297,2.686c-0.722,0.722-2.333,4.482-4.834,11.28l-5.372,13.43c-0.722-1.788-1.796-4.382-3.223-7.789c-1.435-3.399-3.408-7.789-5.909-13.161l-8.057,20.95C55.448,265.279,51.687,256.685,50.613,254.889z M442.737,266.169v2.149l-140.735,15.041l14.503,27.933l-1.074,1.074l-29.543-14.503L271.384,440.21h-2.686l-16.115-142.348l-30.081,14.503l-0.537-1.074l14.503-27.933L96.271,268.318v-2.149l140.198-13.429l-15.04-28.47l1.611-1.611l29.543,14.503l16.115-142.885h2.686l13.966,142.885l30.081-14.503l1.074,1.074l-14.503,29.007L442.737,266.169z M269.236,267.78l-31.155-14.503L104.866,267.78H269.236z M223.578,309.679l45.121-40.287l-30.081,14.503L223.578,309.679z M224.652,225.882l44.584,42.973l-17.726-29.544L224.652,225.882z M253.121,82.46c0.713,0,1.519-0.353,2.417-1.074c0.89-0.714,1.343-3.039,1.343-6.983c0-8.595-0.185-13.429-0.537-14.503c0-1.074-0.361-1.964-1.074-2.686c-0.361-0.353-0.63-0.537-0.806-0.537c-0.185,0-0.454-0.176-0.806-0.537v-1.074h6.983l19.875,20.949v-6.446c0-5.724-0.185-9.132-0.537-10.206c-0.722-1.427-1.796-2.501-3.223-3.223v-1.074h8.594v1.074c-2.509,0.722-3.76,2.333-3.76,4.835v22.561h-1.074l-22.561-24.172v5.909c0,3.223,0,6.094,0,8.595c0,2.148,0.176,4.121,0.537,5.909c0,1.435,1.074,2.333,3.223,2.686v1.074h-8.595V82.46z M269.236,267.78l-14.503,31.156l14.503,133.216V267.78z M268.162,481.034c-5.019,0-9.132-0.714-12.354-2.149l1.611-5.372h0.537c0.713,2.148,1.427,3.584,2.148,4.297c1.427,1.435,4.113,2.149,8.058,2.149c2.862,0,5.187-0.538,6.983-1.612c1.788-1.075,2.686-2.501,2.686-4.297c0-1.788-0.898-3.038-2.686-3.76c-1.074-0.353-3.046-0.89-5.909-1.612c-1.796-0.353-3.223-0.537-4.297-0.537c-0.722,0-1.435-0.176-2.148-0.537c-1.074-0.353-2.333-0.89-3.76-1.612c-1.074-1.427-1.611-3.038-1.611-4.834c0-2.501,1.611-4.65,4.834-6.446c1.788-1.427,4.473-2.148,8.057-2.148c3.576,0,6.983,0.722,10.206,2.148l-1.074,4.297h-1.074c-0.361-3.576-3.223-5.372-8.595-5.372c-2.87,0-5.019,0.722-6.446,2.148c-1.074,1.074-1.611,2.333-1.611,3.76c0,1.796,0.89,3.047,2.686,3.76c1.427,0.722,3.576,1.259,6.446,1.611c1.788,0.361,3.039,0.537,3.76,0.537c1.074,0,1.964,0.185,2.686,0.537c3.575,1.074,5.371,3.047,5.371,5.909c0,3.223-1.611,5.556-4.834,6.983C275.321,480.32,272.098,481.034,268.162,481.034z M269.236,268.855l14.503-31.156l-14.503-133.216V268.855z M314.357,225.882l-45.121,41.898l30.081-14.503L314.357,225.882z M434.68,267.78H269.236l31.155,14.504L434.68,267.78z M312.746,309.679l-43.51-41.899l16.652,29.007L312.746,309.679z M462.612,280.673h-13.966v-1.075c1.427,0,2.149-0.353,2.149-1.074c0.353-1.788,0.537-4.834,0.537-9.132v-13.966c-0.361-1.427-1.259-2.148-2.686-2.148v-1.074h25.247l1.611,6.983h-0.537c-1.796-2.862-3.584-4.474-5.372-4.834c-2.148-0.713-4.658-1.074-7.52-1.074c-2.871,0-4.566,0.092-5.103,0.269c-0.537,0.185-0.806,0.629-0.806,1.343v10.206h6.446c3.223,0,5.187-0.176,5.909-0.537c0.713-0.353,1.427-1.611,2.148-3.76h0.537v9.669h-0.537c-0.722-1.788-1.435-2.862-2.148-3.224c-1.435-0.713-3.584-1.074-6.446-1.074h-5.909v11.28c0,0.722,0.353,1.436,1.074,2.149h3.223c3.937,0,7.697-0.353,11.28-1.074c2.501-0.353,4.297-1.964,5.372-4.834h0.537l-2.149,6.983H462.612z",
				"compass10": "M476.492,259.808l-106.357,51.567l64.996-46.196H270.76v153.628l45.658-53.716l-54.252,107.433l-53.178-107.433l45.121,53.716V265.179H101.556l53.716,46.196L48.378,259.808l106.895-55.865l-53.716,50.493h152.553V96.51l-45.121,53.717l53.178-103.135l54.252,103.135L270.76,96.51v158.463h164.37l-64.996-51.03L476.492,259.808z",
				"compass11": "M247.98,64.515l18.921,18.509l43.188,148.074c4.113,2.198,7.609,4.39,10.488,6.581c2.879,2.198,4.865,4.524,5.964,6.992l16.453,16.042c2.468,2.468,3.701,5.077,3.701,7.815c0,3.843-3.021,7.545-9.049,11.105c-6.034,3.567-13.573,6.723-22.622,9.46l-49.357,164.938l-19.743-19.743l-0.822,3.702l-44.833-155.889c-4.666-2.191-8.091-4.524-10.283-6.992l-15.219-15.219c-6.581-3.837-9.872-7.815-9.872-11.928c0-4.383,3.015-8.497,9.049-12.34c6.028-3.837,13.708-7.262,23.034-10.283l49.357-167.405L247.98,64.515z M323.251,247.962c0-3.291-2.404-6.511-7.198-9.666c-4.801-3.149-10.97-5.894-18.509-8.227c-7.545-2.326-15.836-4.248-24.885-5.759c-9.049-1.503-17.828-2.262-26.324-2.262c-8.779,0-17.686,0.758-26.735,2.262c-9.049,1.511-17.346,3.433-24.884,5.759c-7.545,2.333-13.715,5.077-18.509,8.227c-4.801,3.155-7.198,6.375-7.198,9.666c0,3.021,2.397,6.034,7.198,9.049c4.794,3.021,10.964,5.694,18.509,8.021c7.539,2.333,15.835,4.255,24.884,5.758c9.049,1.51,17.957,2.262,26.735,2.262c8.496,0,17.275-0.752,26.324-2.262c9.049-1.503,17.34-3.425,24.885-5.758c7.539-2.326,13.708-5,18.509-8.021C320.847,253.996,323.251,250.983,323.251,247.962z M246.335,73.153l-44.421,150.542l39.485-6.169h9.46l39.486,6.169L246.335,73.153z M250.86,277.987h-9.46l-39.485-5.758l43.188,150.542l45.244-150.542L250.86,277.987z M271.426,265.237L219.6,239.324v25.913h-16.453v-34.139H219.6l53.882,25.502v-25.502h15.629v34.139H271.426z M245.101,403.028V283.335l33.316-4.113L245.101,403.028z M246.335,211.355V91.661l32.083,125.041L246.335,211.355z M269.78,201.895v9.46l2.468,0.411L269.78,201.895z",
				"compass12": "M255.905,413.375L41.042,467.092L255.905,35.214l213.787,431.878L255.905,413.375z M255.905,51.329L54.47,456.886l201.435-52.104v-74.666l-27.933-37.601v78.425h-45.121V227.518h44.584l28.47,45.122V51.329z M330.032,227.518h-40.287v86.483c-0.36,0-1.703-1.251-4.028-3.761c-2.333-2.501-5.103-5.816-8.325-9.938c-3.224-4.112-6.808-8.502-10.744-13.16c-3.944-4.65-7.52-9.132-10.742-13.429v56.402l30.08,40.824h44.047V227.518z",
				"compass13": "M225.651,455.231l-23.635-20.95v20.95h-7.52v-28.47h7.52l24.173,21.486v-21.486h6.982v28.47H225.651z M250.898,485.849v-249.78h-25.784l35.99-177.264v427.044H250.898z",
				"compass14": "M390.618,388.739c-36.174,36.175-80.221,54.254-132.141,54.254c-52.641,0-97.586-18.079-134.826-54.254c-36.888-35.805-55.327-80.213-55.327-133.216c0-52.994,18.264-98.116,54.79-135.365c36.879-36.879,82-55.328,135.363-55.328c52.281,0,96.504,18.624,132.678,55.865c36.166,37.249,54.253,82.186,54.253,134.828C445.408,307.812,427.146,352.213,390.618,388.739z M161.79,411.838l96.688-31.156l93.466,31.156L258.478,64.831L161.79,411.838z"
			},
			buttons: []
		}
	};

	var cur_lib = library.basic;
	var mode_id = 'compasslib';
	var startClientPos = {};

	function loadIcons() {
		$('#compass_buttons').empty().append(cur_lib.buttons);
	}

	function makeButtons(cat, shapes) {
		var size = cur_lib.size || 300;
		var fill = cur_lib.fill || false;
		var	vb = [0, 0, 512, 512].join(' ');
		var stroke = fill ? 0: (size/30);
		var shape_icon = new DOMParser().parseFromString(
			'<svg xmlns="http://www.w3.org/2000/svg"><svg viewBox="' + vb + '"><path fill="'+(fill?'#333':'none')+'" stroke="#000" stroke-width="' + stroke + '" /></svg></svg>',
			'text/xml');

		var width = 24;
		var height = 24;
		shape_icon.documentElement.setAttribute('width', width);
		shape_icon.documentElement.setAttribute('height', height);
		var svg_elem = $(document.importNode(shape_icon.documentElement,true));

		var data = shapes.data;

		cur_lib.buttons = [];
		var id;
		for (id in data) {
			var path_d = data[id];
			var icon = svg_elem.clone();
			icon.find('path').attr('d', path_d);

			var icon_btn = icon.wrap('<div class="tool_button">').parent().attr({
				id: mode_id + '_' + id,
				title: id
			});
			// Store for later use
			cur_lib.buttons.push(icon_btn[0]);
		}
	}

	function loadLibrary(cat_id) {

		var lib = library[cat_id];
		clickButton_id = cat_id;
		if (!lib) {
			$('#compass_buttons').html('Loading...');
			$.getJSON(svgEditor.curConfig.extPath + 'shapelib/' + cat_id + '.json', function(result) {
				cur_lib = library[cat_id] = {
					data: result.data,
					size: result.size,
					fill: result.fill
				};
				makeButtons(cat_id, result);
				loadIcons();
			});
			return;
		}
		cur_lib = lib;
		if (!lib.buttons.length) {makeButtons(cat_id, lib);}
		loadIcons();
	}

	return {
		svgicons: svgEditor.curConfig.extPath + 'ext-compass.xml',
		buttons: [{
			id: 'tool_compasslib',
			type: 'mode_flyout', // _flyout
			position: 6,
			title: '指北针',
			events: {
				click: function() {
					canv.setMode(mode_id);
				}
			}
		}],
		callback: function() {
			$('<style>').text('\
			#compass_buttons {\
				overflow: auto;\
				width: 180px;\
				max-height: 300px;\
				display: table-cell;\
				vertical-align: middle;\
			}').appendTo('head');

			var btn_div = $('<div id="compass_buttons">');
			$('#tools_compasslib > *').wrapAll(btn_div);

			var shower = $('#tools_compasslib_show');

			loadLibrary('basic');

			// Do mouseup on parent element rather than each button
			$('#compass_buttons').mouseup(function(evt) {
				var btn = $(evt.target).closest('div.tool_button');

				if (!btn.length) {return;}

				var copy = btn.children().clone();
				shower.children(':not(.flyout_arrow_horiz)').remove();
				shower
					.append(copy)
					.attr('data-curopt', '#' + btn[0].id) // This sets the current mode
					.mouseup();
				canv.setMode(mode_id);

				cur_shape_id = btn[0].id.substr((mode_id+'_').length);
				current_d = cur_lib.data[cur_shape_id];

				$('.tools_flyout').fadeOut();
			});

			shower.mouseup(function() {
				canv.setMode(current_d ? mode_id : 'select');
			});
			$('#tool_compasslib').remove();

			var h = $('#tools_compasslib').height();
			$('#tools_compasslib').css({
				'margin-top': -(h/2 - 15),
				'margin-left': 3
			});
		},
		mouseDown: function(opts) {
			var mode = canv.getMode();
			if (mode !== mode_id) {return;}

			start_x = opts.start_x;
			var x = start_x;
			start_y = opts.start_y;
			var y = start_y;
			var cur_style = canv.getStyle();
		 
			startClientPos.x = opts.event.clientX;
			startClientPos.y = opts.event.clientY;

			cur_shape = canv.addSvgElementFromJson({
				'element': 'path',
				'curStyles': true,
				'attr': {
					'd': current_d,
					'id': canv.getNextId(),
					'opacity': cur_style.opacity / 2,
					'style': 'pointer-events:none'
				}
			});

			// Make sure shape uses absolute values
			if (/[a-z]/.test(current_d)) {
				current_d = cur_lib.data[cur_shape_id] = canv.pathActions.convertPath(cur_shape);
				cur_shape.setAttribute('d', current_d);
				canv.pathActions.fixEnd(cur_shape);
			}
			cur_shape.setAttribute('transform', 'translate(' + x + ',' + y + ') scale(0.005) translate(' + -x + ',' + -y + ')');

			canv.recalculateDimensions(cur_shape);

			var tlist = canv.getTransformList(cur_shape);

			lastBBox = cur_shape.getBBox();

			return {
				started: true
			};
		},
		mouseMove: function(opts) {
			var mode = canv.getMode();
			if (mode !== mode_id) {return;}

			var zoom = canv.getZoom();
			var evt = opts.event;

			var x = opts.mouse_x/zoom;
			var y = opts.mouse_y/zoom;

			var tlist = canv.getTransformList(cur_shape),
				box = cur_shape.getBBox(),
				left = box.x, top = box.y, width = box.width,
				height = box.height;
			var dx = (x-start_x), dy = (y-start_y);

			var newbox = {
				'x': Math.min(start_x,x),
				'y': Math.min(start_y,y),
				'width': Math.abs(x-start_x),
				'height': Math.abs(y-start_y)
			};

			var tx = 0, ty = 0,
				sy = height ? (height+dy)/height : 1,
				sx = width ? (width+dx)/width : 1;

			sx = (newbox.width / lastBBox.width) || 1;
			sy = (newbox.height / lastBBox.height) || 1;

			// Not perfect, but mostly works...
			if (x < start_x) {
				tx = lastBBox.width;
			}
			if (y < start_y) {ty = lastBBox.height;}

			// update the transform list with translate,scale,translate
			var translateOrigin = svgroot.createSVGTransform(),
				scale = svgroot.createSVGTransform(),
				translateBack = svgroot.createSVGTransform();

			translateOrigin.setTranslate(-(left+tx), -(top+ty));
			if (!evt.shiftKey) {
				var max = Math.min(Math.abs(sx), Math.abs(sy));

				sx = max * (sx < 0 ? -1 : 1);
				sy = max * (sy < 0 ? -1 : 1);
			}
			scale.setScale(sx,sy);

			translateBack.setTranslate(left+tx, top+ty);
			tlist.appendItem(translateBack);
			tlist.appendItem(scale);
			tlist.appendItem(translateOrigin);

			canv.recalculateDimensions(cur_shape);

			lastBBox = cur_shape.getBBox();
		},
		mouseUp: function(opts) {
			var mode = canv.getMode();
			if (mode !== mode_id) {return;}

			var keepObject = (opts.event.clientX != startClientPos.x && opts.event.clientY != startClientPos.y);

			return {
				keep: keepObject,
				element: cur_shape,
				started: false
			};
		}
	};
});

