Hooks.once("getSceneControlButtons", (controls) => {
  const drawings = buttons.find(b => b.name === "drawings");
  const tiles = buttons.find(b => b.name === "tiles");
  const newButton = {
    name: "dtaligntool",  // just some identifier
    title: game.i18n.localize("dtalign.name"),  // more like the label shown in the tooltip
    icon: "fas fa-plus-circle",  // a FontAwesome icon to show
    visible: true; //game.user.isGM,  // whether to show the control or not, a boolean or a function that returns a boolean
    onClick: () => main(),  // what to do when they click on it
    button: true  // just being explicit that it should be a button rather than a toggle
  };
  drawings.tools.push(newButton);
  tiles.tools.push(newButton);
});


function main() {
  const template = await renderTemplate('modules/dtaligntool/templates/main-dialog.hbs', {
    firstW: '100px',
    secondW: '16px',
    thirdW: '16px'
  });

  // DIALOG
  let d = new Dialog({
      title: `Alignment Tool`,
      content: template,
      buttons: {
        cancel: {
          label: "Close",
        },
      },
  	render: onRender
  }).render(true, {width: '200'});

}
  
function onRender(html) {
	 html.find("button.horz-spacing").click(async function (){
        horizontalSpacing();
    });
	html.find("button.vert-spacing").click(async function (){
        verticalSpacing();
    });
	html.find("button.horz-left").click(async function (){
        horizAlignLeft();
    });
	html.find("button.horz-center").click(async function (){
        horizAlignCenter();
    });
	html.find("button.horz-right").click(async function (){
        horizAlignRight();
    });
	html.find("button.vert-top").click(async function (){
        vertAlignTop();
    });
	html.find("button.vert-center").click(async function (){
        vertAlignCenter();
    });
	html.find("button.vert-bottom").click(async function (){
        vertAlignBottom();
    });
	html.find("button.a-circle").click(async function () {
		makeCircle();
	});
	html.find("button.a-grid").click(async function () {
		makeGrid();
	});
}

// FUNCTIONS
function horizontalSpacing() {
	var drawings = getDrawings();

	if (drawings.length <= 2) {
		return warningMessage("Not enough Drawings or Tiles selected.  Select at least three Drawings or Tiles.");
	}

	let leftD = null, rightD = null;

	drawings.sort((a, b) => (a.center.x+a.width) - (b.center.x+b.width));

	var num = drawings.length - 1;
	var width = drawings[drawings.length-1].center.x - drawings[0].center.x;
	var spacing = width / num;

	leftD = drawings.shift(); 
	rightD = drawings.pop();

	var updates = {};
	
	for (idx in drawings) {
		var drawing = drawings[idx];
		var newCenter = leftD.center.x + spacing + (spacing*idx);
		
		//drawing.document.update({x: newCenter - drawing.width/2});
		if (!Array.isArray(updates[drawing.constructor.name])) {
			updates[drawing.constructor.name] = [];
		}

		updates[drawing.constructor.name].push({_id: drawing.document._id, x: newCenter - getWidth(drawing)/2});
	}    

	doUpdates(updates);
}

function verticalSpacing() {
	var drawings = getDrawings();	

	if (drawings.length <= 2) {
		return warningMessage("Not enough Drawings or Tiles selected.  Select at least three Drawings or Tiles.");
	}

	if (drawings.length > 2) {
		let topD = null

		drawings.sort((a, b) => a.center.y - b.center.y);

		var num = drawings.length - 1;
		var height = drawings[drawings.length-1].center.y - drawings[0].center.y;
		var spacing = height / num;

		// Remove the top and bottom objects.  They don't need moving
		topD = drawings.shift(); 
		drawings.pop();

		var updates = {};
		
		for (idx in drawings) {
			var drawing = drawings[idx];
			var newCenter = topD.center.y + spacing + (spacing*idx);

			if (!Array.isArray(updates[drawing.constructor.name])) {
				updates[drawing.constructor.name] = [];
			}

			updates[drawing.constructor.name].push({_id: drawing.document._id, y: newCenter - getHeight(drawing)/2});
		}   
		doUpdates(updates); 
	}
}

function vertAlignCenter() {
	var drawings = getDrawings();	
	
	if (drawings.length <= 1) {
		return warningMessage("Not enough Drawings or Tiles selected.  Select at least two Drawings or Tiles.");
	}

	if (drawings.length > 1) {
		var centerPoints = [];
		var commonCenter = 0;

		drawings.forEach(drawing => {
			centerPoints.push(drawing.center.y);
		});

		commonCenter = centerPoints.reduce((a, b) => a + b, 0) / centerPoints.length;

		var updates = {};

		drawings.forEach(drawing=> {
			if (commonCenter != drawing.center.y) {
				if (!Array.isArray(updates[drawing.constructor.name])) {
					updates[drawing.constructor.name] = [];
				}

				updates[drawing.constructor.name].push({_id: drawing.document._id, y: commonCenter - getHeight(drawing)/2});
			}
		});

		doUpdates(updates);
	}
}

function horizAlignCenter() {
	var drawings = getDrawings();	

	if (drawings.length <= 1) {
		return warningMessage("Not enough Drawings or Tiles selected.  Select at least two Drawings or Tiles.");
	}

	if (drawings.length > 1) {
		var centerPoints = [];
		var commonCenter = 0;

		drawings.forEach(drawing => {
			centerPoints.push(drawing.center.x);
		});

		commonCenter = centerPoints.reduce((a, b) => a + b, 0) / centerPoints.length;

		var updates = {};

		drawings.forEach(drawing=> {
			if (commonCenter != drawing.center.x) {
				if (!Array.isArray(updates[drawing.constructor.name])) {
					updates[drawing.constructor.name] = [];
				}

				updates[drawing.constructor.name].push({_id: drawing.document._id, x: commonCenter - getWidth(drawing)/2});
			
			}
		});
		doUpdates(updates);
	}
}

function horizAlignLeft() {
	var drawings = getDrawings();

	if (drawings.length <= 1) {
		return warningMessage("Not enough Drawings or Tiles selected.  Select at least two Drawings or Tiles.");
	}
	
	var leftPoints = [];
	var commonLeft = 0;

	drawings.forEach(drawing => {
		leftPoints.push(drawing.x);
	});

	commonLeft = Math.min(...leftPoints);			

	var updates = {};

	drawings.forEach(drawing=> {
		if (!Array.isArray(updates[drawing.constructor.name])) {
			updates[drawing.constructor.name] = [];
		}

		updates[drawing.constructor.name].push({_id: drawing.document._id, x: commonLeft});
	});
	doUpdates(updates);

}

function horizAlignRight() {
	var drawings = getDrawings();
	
	if (drawings.length <= 1) {
		return warningMessage("Not enough Drawings or Tiles selected.  Select at least two Drawings or Tiles.");
	}

	var rightPoints = [];
	var commonRight = 0;

	drawings.forEach(drawing => {
		rightPoints.push(drawing.x + getWidth(drawing));
	});

	commonRight = Math.max(...rightPoints);	

	var updates = {};

	drawings.forEach(drawing=> {
		if (!Array.isArray(updates[drawing.constructor.name])) {
			updates[drawing.constructor.name] = [];
		}

		updates[drawing.constructor.name].push({_id: drawing.document._id, x: commonRight - getWidth(drawing)});
	});
	doUpdates(updates);
}

function vertAlignBottom() {
	var drawings = getDrawings();
	
	if (drawings.length <= 1) {
		return warningMessage("Not enough Drawings or Tiles selected.  Select at least two Drawings or Tiles.");
	}

	var bottomPoints = [];
	var commonBottom = 0;

	drawings.forEach(drawing => {
		bottomPoints.push(drawing.y + getHeight(drawing));
	});

	commonBottom = Math.max(...bottomPoints);	

	var updates = {};

	drawings.forEach(drawing=> {
		if (!Array.isArray(updates[drawing.constructor.name])) {
			updates[drawing.constructor.name] = [];
		}
		updates[drawing.constructor.name].push({_id: drawing.document._id, y: commonBottom - getHeight(drawing)});
	});
	doUpdates(updates);
}

function vertAlignTop() {
	var drawings = getDrawings();
	
	if (drawings.length <= 1) {
		return warningMessage("Not enough Drawings or Tiles selected.  Select at least two Drawings or Tiles.");
	}

	var topPoints = [];
	var commonTop = 0;

	drawings.forEach(drawing => {
		topPoints.push(drawing.y);
	});

	commonTop = Math.min(...topPoints);	

	var updates = {};

	drawings.forEach(drawing=> {
		if (!Array.isArray(updates[drawing.constructor.name])) {
			updates[drawing.constructor.name] = [];
		}
		updates[drawing.constructor.name].push({_id: drawing.document._id, y: commonTop });
	});
	doUpdates(updates);
}

function makeGrid() {
	var drawings = getDrawings();
	
	if (drawings.length <= 3) {
		return warningMessage("Not enough Drawings or Tiles selected.  Select at least four Drawings or Tiles.");
	}

	positionInGrid(drawings);
}

function findTopLeftMostPos(objects) {
	if (objects.length === 0) {
		return { x:0, y:0 };
	}

	const leftObj = objects.reduce((minXObject, currentObject) => {
		return currentObject.center.x < minXObject.center.x ? currentObject : minXObject;
	}, objects[0]);

	const topObj = objects.reduce((minXObject, currentObject) => {
		return currentObject.center.y < minXObject.center.y ? currentObject : minXObject;
	}, objects[0]);

	return { x:leftObj.x, y:topObj.y};
}

function positionInGrid(objects) {
	let maxDistance = 0;
	let maxDistanceX = 0;
	let maxDistanceY = 0;

	for (let i = 0; i < objects.length; i++) {
		for (let j = i + 1; j < objects.length; j++) {
			const distanceX = calculateDistanceX(objects[i], objects[j]);
			const distanceY = calculateDistanceY(objects[i], objects[j]);
			if (distanceX > maxDistanceX) {
				maxDistanceX = distanceX;
			}
			if (distanceY > maxDistanceY) {
				maxDistanceY = distanceY;
			}
		}
	}

	maxDistance = (maxDistanceX > 0) ? maxDistanceX : maxDistanceY;

	const topLeftPos = findTopLeftMostPos(objects);
	const squareWidth = maxDistance;
	const squareHeight = maxDistance;
	const numOfObjects = objects.length;
	const sideLength = Math.ceil(Math.sqrt(numOfObjects));
	const gapX = squareWidth / (sideLength - 1);
	const gapY = squareHeight / (sideLength - 1);

	var updates = {};

	objects.forEach((obj, index) => {
		const row = Math.floor(index / sideLength);
		const col = index % sideLength;

		const x = col * gapX;
		const y = row * gapY;

		if (!Array.isArray(updates[obj.constructor.name])) {
			updates[obj.constructor.name] = [];
		}
		updates[obj.constructor.name].push({_id: obj.document._id, x : topLeftPos.x  + x - getWidth(obj)/2, y : topLeftPos.y + y - getHeight(obj)/2 });
		
		
	});
	doUpdates(updates);
}

function makeCircle() {
	var drawings = getDrawings();
	
	if (drawings.length <= 3) {
		return warningMessage("Not enough Drawings or Tiles selected.  Select at least four Drawings or Tiles.");
	}

	positionInCircle(drawings);
}

function calculateDistanceX(obj1, obj2) {
	const dx = Math.abs(obj2.center.x - obj1.center.x);
  	return dx;
}

function calculateDistanceY(obj1, obj2) {
	const dy = Math.abs(obj2.center.y - obj1.center.y);
  	return dy;
}

function calculateDistanceXY(obj1, obj2) {
	const dx = obj2.center.x - obj1.center.x;
	const dy = obj2.center.y - obj1.center.y;
	return Math.sqrt(dx * dx + dy * dy);
}

function findCenterCoordinate(objects) {
	if (objects.length === 0) {
		return { x: 0, y: 0 };
	}

	let totalX = 0;
	let totalY = 0;

	objects.forEach(obj => {
		totalX += obj.center.x;
		totalY += obj.center.y;
	});

	const avgX = totalX / objects.length;
	const avgY = totalY / objects.length;

	return { x: avgX, y: avgY };
}


function positionInCircle(objects) {
	let maxDistance = 0;
	let maxDistanceX = 0;
	let maxDistanceY = 0;

	for (let i = 0; i < objects.length; i++) {
		for (let j = i + 1; j < objects.length; j++) {
			const distanceX = calculateDistanceX(objects[i], objects[j]);
			const distanceY = calculateDistanceY(objects[i], objects[j]);
			if (distanceX > maxDistanceX) {
				maxDistanceX = distanceX;
			}
			if (distanceY > maxDistanceY) {
				maxDistanceY = distanceY;
			}
		}
	}

	maxDistance = (maxDistanceX > 0) ? maxDistanceX : maxDistanceY;

	const center = findCenterCoordinate(objects);
	const radius = maxDistance / 2;
	const numOfObjects = objects.length;
	const angleIncrement = (2 * Math.PI) / numOfObjects;

	var updates = {};

	objects.forEach((obj, index) => {
		const angle = index * angleIncrement;
		const x = center.x + radius * Math.cos(angle);
		const y = center.y + radius * Math.sin(angle);

		if (!Array.isArray(updates[obj.constructor.name])) {
			updates[obj.constructor.name] = [];
		}
		updates[obj.constructor.name].push({_id: obj.document._id, x : x - getWidth(obj)/2, y : y - getHeight(obj)/2});
	});
	doUpdates(updates);
}

function getHeight(placeable) {
	if (placeable instanceof PlaceableObject ) {
		if (placeable.constructor.name == "Tile") {
			return placeable.document.height;
		} else if (placeable.constructor.name == "Drawing") {
			return placeable.document.shape.height;
		}
		return placeable.height;
	}
	return 0;
}

function getWidth(placeable) {
	if (placeable instanceof PlaceableObject ) {
		if (placeable.constructor.name == "Tile") {
			return placeable.document.width;
		} else if (placeable.constructor.name == "Drawing") {
			return placeable.document.shape.width;
		}
		return placeable.width;
	}
	return 0;	
}

function warningMessage(message) {
	return ui.notifications.warn(message);
}

function doUpdates(updates) {
	for (const key in updates) {
		canvas.scene.updateEmbeddedDocuments(key, updates[key]);
	}
}

function getDrawings() {
	var drawings  = canvas.drawings.controlled;
	drawings  = drawings.concat(canvas.tiles.controlled);
	//drawings = drawings.concat(canvas.tokens.controlled);
	return drawings;
}
