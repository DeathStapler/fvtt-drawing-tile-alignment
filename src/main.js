Hooks.on("getSceneControlButtons", (controls) => {
  const newButton = {
    name: "dtaligntool",
    title: game.i18n.localize("dtalign.name"),
    icon: "fa fa-objects-align-left",
    visible: true,
    onChange: () => TDAlignTool.main(),
    button: true
  };
  controls.drawings.tools.dtaligntool = newButton;
  controls.tiles.tools.dtaligntool = newButton;
});

class TDAlignTool {

  static dialog = null;

  static async main() {
    if (TDAlignTool.dialog?.rendered) {
      TDAlignTool.dialog.bringToFront();
      return;
    }
    TDAlignTool.dialog = new TDAlignDialog();
    TDAlignTool.dialog.render({ force: true });
  }


  static horizontalSpacing() {
  	var drawings = TDAlignTool.getDrawings();
  
  	if (drawings.length <= 2) {
  		return TDAlignTool.warningMessage( game.i18n.localize("dtalign.warningthree") );
  	}
  
  	let leftD = null, rightD = null;
  
  	drawings.sort((a, b) => (a.center.x+a.width) - (b.center.x+b.width));
  
  	var num = drawings.length - 1;
  	var width = drawings[drawings.length-1].center.x - drawings[0].center.x;
  	var spacing = width / num;
  
  	leftD = drawings.shift(); 
  	rightD = drawings.pop();
  
  	var updates = {};
  	
  	for (const idx in drawings) {
  		var drawing = drawings[idx];
  		var newCenter = leftD.center.x + spacing + (spacing*idx);
  		
  		//drawing.document.update({x: newCenter - drawing.width/2});
  		if (!Array.isArray(updates[drawing.constructor.name])) {
  			updates[drawing.constructor.name] = [];
  		}
  
  		updates[drawing.constructor.name].push({_id: drawing.document.id, x: newCenter - TDAlignTool.getWidth(drawing)/2});
  	}    
  
  	TDAlignTool.doUpdates(updates);
  }
  
  static verticalSpacing() {
  	var drawings = TDAlignTool.getDrawings();	
  
  	if (drawings.length <= 2) {
  		return TDAlignTool.warningMessage( game.i18n.localize("dtalign.warningthree") );
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
  		
  		for (const idx in drawings) {
  			var drawing = drawings[idx];
  			var newCenter = topD.center.y + spacing + (spacing*idx);
  
  			if (!Array.isArray(updates[drawing.constructor.name])) {
  				updates[drawing.constructor.name] = [];
  			}
  
  			updates[drawing.constructor.name].push({_id: drawing.document.id, y: newCenter - TDAlignTool.getHeight(drawing)/2});
  		}   
  		TDAlignTool.doUpdates(updates); 
  	}
  }
  
  static vertAlignCenter() {
  	var drawings = TDAlignTool.getDrawings();	
  	
  	if (drawings.length <= 1) {
  		return TDAlignTool.warningMessage( game.i18n.localize("dtalign.warningtwo") );
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
  
  				updates[drawing.constructor.name].push({_id: drawing.document.id, y: commonCenter - TDAlignTool.getHeight(drawing)/2});
  			}
  		});
  
  		TDAlignTool.doUpdates(updates);
  	}
  }
  
  static horizAlignCenter() {
  	var drawings = TDAlignTool.getDrawings();	
  
  	if (drawings.length <= 1) {
  		return TDAlignTool.warningMessage( game.i18n.localize("dtalign.warningtwo") );
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
  
  				updates[drawing.constructor.name].push({_id: drawing.document.id, x: commonCenter - TDAlignTool.getWidth(drawing)/2});
  			
  			}
  		});
  		TDAlignTool.doUpdates(updates);
  	}
  }
  
  static horizAlignLeft() {
  	var drawings = TDAlignTool.getDrawings();
  
  	if (drawings.length <= 1) {
  		return TDAlignTool.warningMessage( game.i18n.localize("dtalign.warningtwo") );
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
  
  		updates[drawing.constructor.name].push({_id: drawing.document.id, x: commonLeft});
  	});
  	TDAlignTool.doUpdates(updates);
  
  }
  
  static horizAlignRight() {
  	var drawings = TDAlignTool.getDrawings();
  	
  	if (drawings.length <= 1) {
  		return TDAlignTool.warningMessage( game.i18n.localize("dtalign.warningtwo") );
  	}
  
  	var rightPoints = [];
  	var commonRight = 0;
  
  	drawings.forEach(drawing => {
  		rightPoints.push(drawing.x + TDAlignTool.getWidth(drawing));
  	});
  
  	commonRight = Math.max(...rightPoints);	
  
  	var updates = {};
  
  	drawings.forEach(drawing=> {
  		if (!Array.isArray(updates[drawing.constructor.name])) {
  			updates[drawing.constructor.name] = [];
  		}
  
  		updates[drawing.constructor.name].push({_id: drawing.document.id, x: commonRight - TDAlignTool.getWidth(drawing)});
  	});
  	TDAlignTool.doUpdates(updates);
  }
  
  static vertAlignBottom() {
  	var drawings = TDAlignTool.getDrawings();
  	
  	if (drawings.length <= 1) {
  		return TDAlignTool.warningMessage( game.i18n.localize("dtalign.warningtwo") );
  	}
  
  	var bottomPoints = [];
  	var commonBottom = 0;
  
  	drawings.forEach(drawing => {
  		bottomPoints.push(drawing.y + TDAlignTool.getHeight(drawing));
  	});
  
  	commonBottom = Math.max(...bottomPoints);	
  
  	var updates = {};
  
  	drawings.forEach(drawing=> {
  		if (!Array.isArray(updates[drawing.constructor.name])) {
  			updates[drawing.constructor.name] = [];
  		}
  		updates[drawing.constructor.name].push({_id: drawing.document.id, y: commonBottom - TDAlignTool.getHeight(drawing)});
  	});
  	TDAlignTool.doUpdates(updates);
  }
  
  static vertAlignTop() {
  	var drawings = TDAlignTool.getDrawings();
  	
  	if (drawings.length <= 1) {
  		return TDAlignTool.warningMessage( game.i18n.localize("dtalign.warningtwo") );
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
  		updates[drawing.constructor.name].push({_id: drawing.document.id, y: commonTop });
  	});
  	TDAlignTool.doUpdates(updates);
  }
  
  static makeGrid() {
  	var drawings = TDAlignTool.getDrawings();
  	
  	if (drawings.length <= 3) {
  		return TDAlignTool.warningMessage( game.i18n.localize("dtalign.warningfour") );
  	}
  
  	TDAlignTool.positionInGrid(drawings);
  }
  
  static findTopLeftMostPos(objects) {
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
  
  static positionInGrid(objects) {
  	let maxDistance = 0;
  	let maxDistanceX = 0;
  	let maxDistanceY = 0;
  
  	for (let i = 0; i < objects.length; i++) {
  		for (let j = i + 1; j < objects.length; j++) {
  			const distanceX = TDAlignTool.calculateDistanceX(objects[i], objects[j]);
  			const distanceY = TDAlignTool.calculateDistanceY(objects[i], objects[j]);
  			if (distanceX > maxDistanceX) {
  				maxDistanceX = distanceX;
  			}
  			if (distanceY > maxDistanceY) {
  				maxDistanceY = distanceY;
  			}
  		}
  	}
  
  	maxDistance = (maxDistanceX > 0) ? maxDistanceX : maxDistanceY;
  
  	const topLeftPos = TDAlignTool.findTopLeftMostPos(objects);
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
  		updates[obj.constructor.name].push({_id: obj.document.id, x : topLeftPos.x  + x - TDAlignTool.getWidth(obj)/2, y : topLeftPos.y + y - TDAlignTool.getHeight(obj)/2 });
  		
  		
  	});
  	TDAlignTool.doUpdates(updates);
  }
  
  static makeCircle() {
  	var drawings = TDAlignTool.getDrawings();
  	
  	if (drawings.length <= 3) {
  		return TDAlignTool.warningMessage( game.i18n.localize("dtalign.warningfour") );
  	}
  
  	TDAlignTool.positionInCircle(drawings);
  }
  
  static calculateDistanceX(obj1, obj2) {
  	const dx = Math.abs(obj2.center.x - obj1.center.x);
    	return dx;
  }
  
  static calculateDistanceY(obj1, obj2) {
  	const dy = Math.abs(obj2.center.y - obj1.center.y);
    	return dy;
  }
  
  static calculateDistanceXY(obj1, obj2) {
  	const dx = obj2.center.x - obj1.center.x;
  	const dy = obj2.center.y - obj1.center.y;
  	return Math.sqrt(dx * dx + dy * dy);
  }
  
  static findCenterCoordinate(objects) {
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
  
  
  static positionInCircle(objects) {
  	let maxDistance = 0;
  	let maxDistanceX = 0;
  	let maxDistanceY = 0;
  
  	for (let i = 0; i < objects.length; i++) {
  		for (let j = i + 1; j < objects.length; j++) {
  			const distanceX = TDAlignTool.calculateDistanceX(objects[i], objects[j]);
  			const distanceY = TDAlignTool.calculateDistanceY(objects[i], objects[j]);
  			if (distanceX > maxDistanceX) {
  				maxDistanceX = distanceX;
  			}
  			if (distanceY > maxDistanceY) {
  				maxDistanceY = distanceY;
  			}
  		}
  	}
  
  	maxDistance = (maxDistanceX > 0) ? maxDistanceX : maxDistanceY;
  
  	const center = TDAlignTool.findCenterCoordinate(objects);
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
  		updates[obj.constructor.name].push({_id: obj.document.id, x : x - TDAlignTool.getWidth(obj)/2, y : y - TDAlignTool.getHeight(obj)/2});
  	});
  	TDAlignTool.doUpdates(updates);
  }
  
  static getHeight(placeable) {
  	if (placeable?.document) {
  		if (placeable.constructor.name == "Tile") {
  			return placeable.document.height;
  		} else if (placeable.constructor.name == "Drawing") {
  			return placeable.document.shape.height;
  		}
  		return placeable.height;
  	}
  	return 0;
  }
  
  static getWidth(placeable) {
  	if (placeable?.document) {
  		if (placeable.constructor.name == "Tile") {
  			return placeable.document.width;
  		} else if (placeable.constructor.name == "Drawing") {
  			return placeable.document.shape.width;
  		}
  		return placeable.width;
  	}
  	return 0;	
  }
  
  static warningMessage(message) {
  	return ui.notifications.warn(message);
  }
  
  static doUpdates(updates) {
  	for (const key in updates) {
  		canvas.scene.updateEmbeddedDocuments(key, updates[key]);
  	}
  }
  
  static getDrawings() {
  	var drawings  = canvas.drawings.controlled;
  	drawings  = drawings.concat(canvas.tiles.controlled);
  	return drawings;
  }
}

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

class TDAlignDialog extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "dtaligntool-dialog",
    classes: ["dtaligntool"],
    position: { width: 200, height: "auto" },
    window: { title: "Alignment Tool", resizable: false },
    actions: {
      horzSpacing: TDAlignDialog.#horzSpacing,
      vertSpacing: TDAlignDialog.#vertSpacing,
      horzLeft: TDAlignDialog.#horzLeft,
      horzCenter: TDAlignDialog.#horzCenter,
      horzRight: TDAlignDialog.#horzRight,
      vertTop: TDAlignDialog.#vertTop,
      vertCenter: TDAlignDialog.#vertCenter,
      vertBottom: TDAlignDialog.#vertBottom,
      makeCircle: TDAlignDialog.#makeCircle,
      makeGrid: TDAlignDialog.#makeGrid
    }
  };

  static PARTS = {
    form: {
      template: "modules/dtaligntool/templates/main-dialog.hbs"
    }
  };

  _onClose(options) {
    TDAlignTool.dialog = null;
    super._onClose(options);
  }

  static async #horzSpacing() { await TDAlignTool.horizontalSpacing(); }
  static async #vertSpacing() { await TDAlignTool.verticalSpacing(); }
  static async #horzLeft() { await TDAlignTool.horizAlignLeft(); }
  static async #horzCenter() { await TDAlignTool.horizAlignCenter(); }
  static async #horzRight() { await TDAlignTool.horizAlignRight(); }
  static async #vertTop() { await TDAlignTool.vertAlignTop(); }
  static async #vertCenter() { await TDAlignTool.vertAlignCenter(); }
  static async #vertBottom() { await TDAlignTool.vertAlignBottom(); }
  static async #makeCircle() { await TDAlignTool.makeCircle(); }
  static async #makeGrid() { await TDAlignTool.makeGrid(); }
}
