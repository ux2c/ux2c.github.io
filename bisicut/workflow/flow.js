
        function flowChart() {
            var stage = document.getElementById('stage');

            if (!stage) {
                stage = document.createElement('div');
                stage.id = 'stage';
                document.getElementsByTagName('body')[0].appendChild(stage);
            };

            function display(workflow) {
                var elements = workflow.children,
                    elementHeight = parseInt(stage.clientHeight / (elements.length * 2)),
                    bufferHeight = parseInt((stage.clientHeight - elementHeight * elements.length) / (elements.length - 1)),
                    elementWidth = elementHeight * 4,
                    bufferWidth = elementHeight,
                    shapeX = parseInt(stage.clientWidth / 2),
                    shapeY = parseInt(elementHeight / 2),
                    shapes = {};

                function sire(name, attrs, text) {
                    var svg = this,
                        doc = this.ownerDocument;
                    while (svg.tagName != 'svg') svg = svg.parentNode;
                    var el = doc.createElementNS(svg.namespaceURI, name);
                    for (var a in attrs) {
                        if (!attrs.hasOwnProperty(a)) continue;
                        var p = a.split(':');
                        if (p[1]) el.setAttributeNS(svg.getAttribute('xmlns:' + p[0]), p[1], attrs[a]);
                        else el.setAttribute(a, attrs[a]);
                    };
                    el.sire = sire;
                    if (text) el.appendChild(doc.createTextNode(text));
                    this.appendChild(el);
                    return el;
                };

                function drawConnector(local, remote, label) {
                    var l, r, localConnector, remoteConnector, connection, connectors, centers, adjustment, paths = [];

                    function distance(path) {
                        return Math.pow(Math.pow(path[1][0] - path[0][0], 2) + Math.pow(path[1][1] - path[0][1], 2), .5);
                    };

                    function arrowHead(x, y, a) {
                        scale = 10;
                        stage.background.sire('path', {
                            'd': 'M ' + x + ' ' + y + ' m ' + Math.cos(a - .4) * scale + ' ' + Math.sin(a - .4) * scale + ' L ' + x + ' ' + y + ' l ' + Math.cos(a + .4) * scale + ' ' + Math.sin(a + .4) * scale + ' z',
                            'class': 'arrow'
                        });
                    }

                    for (l = 0; l < local.connectors.length; l += 1) {
                        if (local.connections.indexOf(local.connectors[l]) > -1) continue;

                        for (r = 0; r < remote.connectors.length; r += 1) {
                            if (remote.connections.indexOf(remote.connectors[r]) > -1) continue;
                            paths.push([local.connectors[l], remote.connectors[r]]);
                        };
                    };

                    paths.sort(function (a, b) {
                        return distance(a) - distance(b);
                    });
                    //need to defer secondary connections until after all primary connections are made, and process secondary from shortest to longest path
                    //console.log(local, remote, paths);
                    connectors = paths[0];
                    centers = distance([
                        [local.x, local.y],
                        [remote.x, remote.y]
                    ]);

                    if (distance(connectors) > centers) {
                        adjustment = Math.pow(centers / (elementHeight + bufferHeight), .25) + .25;
                        /*
                            connection = stage.background.sire('path', {
                            'd': 'M ' + local.x + ' ' + local.y + ' L ' + connectors[0][0] + ' ' + connectors[0][1] + ' c ' + (connectors[0][0] - local.x) * adjustment + ' ' + (connectors[0][1] - local.y) + ', ' + (connectors[1][0] - local.x) * adjustment + ' ' + (connectors[1][1] - local.y) + ', ' + (connectors[1][0] - connectors[0][0]) + ' ' + (connectors[1][1] - connectors[0][1]) + ' L ' + remote.x + ' ' + remote.y, 'class': 'connector'
                        });
                        */
                        connection = stage.background.sire('path', {
                            'd': 'M ' + local.x + ' ' + local.y + ' l ' + parseInt((connectors[0][0] - local.x) * adjustment) + ' ' + (connectors[0][1] - local.y) + ', 0 ' + (remote.y - local.y) + ', ' + parseInt((local.x - connectors[0][0]) * adjustment) + ' 0',
                            'class': 'connector'
                        });

                        arrowHead(connectors[1][0], connectors[1][1], Math.PI * 3);
                    } else {

                        connection = stage.background.sire('path', {
                            'd': 'M ' + connectors[0][0] + ' ' + connectors[0][1] + ' L ' + connectors[1][0] + ' ' + connectors[1][1],
                            'class': 'connector'
                        });

                        arrowHead(connectors[1][0], connectors[1][1], Math.PI * 3 / 2);
                    };

                    if (label) {
                        //connection.setAttribute('svg:title', label);
                        var angle = Math.atan2(connectors[0][0] - remote.x, remote.y - connectors[0][1]);

                        stage.foreground.sire('text', {
                            'x': connectors[0][0] + (angle ? Math.cos(angle - Math.PI / 2) * elementHeight / 3 : elementHeight / 2),
                            'y': connectors[0][1] + (angle ? Math.sin(angle - Math.PI / 2) * elementHeight / 3 + elementHeight * 0 / 4 : elementHeight / 4),
                            'class': 'label'
                        }, label)
                    };

                    local.connections.push(connectors[0]);
                    remote.connections.push(connectors[1]);
                };

                stage.sire = sire;
                stage.background = stage.sire('g');
                stage.foreground = stage.sire('g');
                stage.style.fontSize = '32px';

                shapes['terminator'] = function (caption) {
                    var shape = stage.foreground.sire('path', {
                        'd': 'M' + (shapeX - elementWidth / 2 + elementHeight / 3) + ' ' + (shapeY - elementHeight / 2) + ' l ' + (elementWidth - elementHeight * 2 / 3) + ' 0 c ' + (elementHeight / 4) + ' 0, ' + (elementHeight / 3) + ' ' + (elementHeight / 12) + ', ' + (elementHeight / 3) + ' ' + (elementHeight / 3) + ' l 0 ' + (elementHeight / 3) + ' c 0 ' + (elementHeight / 4) + ', -' + (elementHeight / 12) + ' ' + (elementHeight / 3) + ', -' + (elementHeight / 3) + ' ' + (elementHeight / 3) + ' l -' + (elementWidth - elementHeight * 2 / 3) + ' 0 c -' + (elementHeight / 4) + ' 0, -' + (elementHeight / 3) + ' -' + (elementHeight / 12) + ', -' + (elementHeight / 3) + ' -' + (elementHeight / 3) + ' l 0 -' + (elementHeight / 3) + ' c 0 -' + (elementHeight / 4) + ', ' + (elementHeight / 12) + ' -' + (elementHeight / 3) + ', ' + (elementHeight / 3) + ' -' + (elementHeight / 3) + ' z',
                        'class': 'terminator'
                    });
                    shape.x = shapeX;
                    shape.y = shapeY;
                    shape.connectors = [
                        [shapeX, shapeY - elementHeight / 2],
                        [shapeX - elementWidth / 2, shapeY],
                        [shapeX, shapeY + elementHeight / 2],
                        [shapeX + elementWidth / 2, shapeY]
                    ];
                    shape.connections = [];
                    shape.connect = function (remote, label) {
                        drawConnector(this, remote, label);
                    };
                    if (caption) {
                        stage.foreground.sire('text', {
                            'x': shapeX,
                            'y': shapeY,
                            'class': 'caption'
                        }, caption);
                    };
                    shape.textAdjust = function () {
                        if (shape.text) {
                            var textW = shape.text.getBBox().width,
                                shapeW = shape.getBBox().width;
                            if (textW * 2 > shapeW) {
                                stage.style.fontSize = parseInt(parseInt(stage.style.fontSize) * shapeW / textW / 2) + 'px';
                            };
                        };
                    };
                    return shape;
                };

                shapes['process'] = function (caption) {
                    var shape = stage.foreground.sire('path', {
                        'd': 'M' + (shapeX - elementWidth / 2) + ' ' + (shapeY - elementHeight / 2) + ' l' + elementWidth + ' 0, 0 ' + elementHeight + ', -' + elementWidth + ' 0 z',
                        'class': 'process'
                    });
                    shape.x = shapeX;
                    shape.y = shapeY;
                    shape.connectors = [
                        [shapeX, shapeY - elementHeight / 2],
                        [shapeX - elementWidth / 2, shapeY],
                        [shapeX, shapeY + elementHeight / 2],
                        [shapeX + elementWidth / 2, shapeY]
                    ];
                    shape.connections = [];
                    shape.connect = function (remote, label) {
                        drawConnector(this, remote, label);
                    };
                    if (caption) {
                        stage.foreground.sire('text', {
                            'x': shapeX,
                            'y': shapeY,
                            'class': 'caption'
                        }, caption);
                    };
                    shape.textAdjust = function () {
                        console.log(stage.style.fontSize);

                        if (shape.text) {
                            var textW = shape.text.getBBox().width,
                                shapeW = shape.getBBox().width;

                            if (textW * 2 > shapeW) {
                                stage.style.fontSize = parseInt(parseInt(stage.style.fontSize) * shapeW / textW / 3) + 'px';
                            };
                        };
                    };
                    //console.log(stage.style.fontSize);

                    return shape;
                };

                shapes['decision'] = function (caption) {
                    var shape = stage.foreground.sire('path', {
                        'd': 'M' + shapeX + ' ' + (shapeY - elementHeight * 3 / 4) + ' l ' + (elementWidth * 2 / 3) + ' ' + (elementHeight * 3 / 4) + ', -' + (elementWidth * 2 / 3) + ' ' + (elementHeight * 3 / 4) + ' -' + (elementWidth * 2 / 3) + ' -' + (elementHeight * 3 / 4) + ' z',
                        'class': 'decision'
                    });
                    shape.x = shapeX;
                    shape.y = shapeY;
                    shape.connectors = [
                        [shapeX, shapeY - elementHeight * 3 / 4],
                        [shapeX - elementWidth * 2 / 3, shapeY],
                        [shapeX, shapeY + elementHeight * 3 / 4],
                        [shapeX + elementWidth * 2 / 3, shapeY]
                    ];
                    shape.connections = [];
                    shape.connect = function (remote, label) {
                        drawConnector(this, remote, label);
                    };
                    if (caption) {
                        shape.text = stage.foreground.sire('text', {
                            'x': shapeX,
                            'y': shapeY,
                            'class': 'caption'
                        }, caption);
                    };
                    shape.textAdjust = function () {
                        if (shape.text) {
                            var textW = shape.text.getBBox().width,
                                shapeW = shape.getBBox().width;
                            if (textW * 2 > shapeW) {
                                stage.style.fontSize = parseInt(parseInt(stage.style.fontSize) * shapeW / textW / 2) + 'px';
                            };
                        };
                    };
                    return shape;
                };



                /*
                      <path d="M131.6,121.2c-13.8-0.2-12.5-25.6-28.9-30.7c-12-3.7-23,7.9-29,18.9
            c-4.7,8.5-8.5,17.5-11.6,26.7c-1.1-12.6,2.7-24.7,8.3-36c2.4-4.7,6.2-9.2,10.3-12.6c6.9-5.6,13.9-8.2,22.8-8.7"/>
            stage.style.fontSize = shapeY + 'px';
            
                        function newShape(caption) {
                          var shape = document.createElement('div'),
                            paragraph = document.createElement('p'),
                            span = document.createElement('span');
                          shape.style.position = 'absolute';
                          shape.style.left = shapeX - elementWidth / 2 + 'px';
                          shape.style.top = shapeY - elementHeight / 2 + 'px';
                          shape.style.width = elementWidth + 'px';
                          shape.style.height = elementHeight + 'px';
                          shape.appendChild(paragraph);
                          paragraph.appendChild(span);
                          span.appendChild(document.createTextNode(caption));
                          
                          shape.textAdjust = function() {
                                var t = span.getBoundingClientRect().height, b = shape.getBoundingClientRect().height;
                                if (t > b) {
                                stage.style.fontSize = parseInt(parseInt(stage.style.fontSize) * b / t) + 'px';
                              paragraph.style.marginTop = 0;
                            };
                            
                            paragraph.style.marginTop = (shape.getBoundingClientRect().height - span.getBoundingClientRect().height) / 2 + 'px';
                          };
                          return shape;
                        };
                        
                        shapes['terminator'] = function(caption) {
                          var terminator = newShape(caption);
                          terminator.style.borderRadius = '50%';
                          terminator.className = 'terminator';
                          return terminator;
                        };
                        
                        shapes['process'] = function(caption) {
                          var process = newShape(caption);
                          process.className = 'process';
                          return process;
                        };
            
                        shapes['decision'] = function(caption) {
                          var decision = newShape(caption);
                          decision.className = 'decision';
                          return decision;
                        };
                */
                (function (elements) {
                    var e, element, l = elements.length,
                        lastShape;
                    for (e = 0; e < l; e += 1) {
                        (function (element) {
                            var shape = shapes[element.className](element.innerText);
                            element.shape = shape;

                            shape.textAdjust();

                            if (lastShape) {
                                lastShape.nextShape = shape;
                            };

                            lastShape = shape;

                            shapeY += elementHeight + bufferHeight;
                        }(elements[e]));
                    };

                    for (e = 0; e < l; e += 1) {
                        (function (element) {
                            var alternate, labeled, connected = false,
                                shape = element.shape;

                            if (shape) {
                                shape.textAdjust();

                                if (element.hasAttributes()) {
                                    if (element.attributes['yes']) {
                                        alternate = document.getElementById(element.attributes['yes'].value);

                                        if (alternate.shape) {
                                            shape.connect(shape.nextShape, 'no');
                                            shape.connect(alternate.shape, 'yes');
                                        } else {
                                            shape.connect(shape.nextShape);
                                        };

                                        connected = true;
                                    };

                                    if (element.attributes['no']) {
                                        alternate = document.getElementById(element.attributes['no'].value);

                                        if (alternate.shape) {
                                            shape.connect(shape.nextShape, 'yes');
                                            shape.connect(alternate.shape, 'no');
                                        } else {
                                            shape.connect(shape.nextShape);
                                        };

                                        connected = true;
                                    };
                                };

                                if (shape.nextShape && !connected) {
                                    shape.connect(shape.nextShape);
                                };
                            };
                        }(elements[e]));
                    };
                    /*
                          for (e = 0; e < stage.children.length; e += 1) {
                            stage.children[e].textAdjust();
                          }
                          */
                }(workflow.children));
            };
            (function (workflows) {
                var w, l = workflows.length;

                for (w = 0; w < l; w += 1) {
                    display(workflows[w]);
                };
            }(document.getElementsByClassName('workflow')));
        };

        setTimeout(flowChart, 40);