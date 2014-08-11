// the global object that contains the variable needed for the car game
var carGame =
{
	// game state constant
	STATE_STARTING_SCREEN : 1,
	STATE_PLAYING : 2,
	STATE_GAMEOVER_SCREEN : 3,
	state : 0,
	fuel: 0,
	fuelMax: 0,
	currentLevel: 0
}

var canvas;
var ctx;
var canvasWidth
var canvasHeight;

var car;

carGame.levels = new Array();
carGame.levels[0] = [{"type":"car","x":50,"y":215,"fuel":20},
	{"type":"box","x":250, "y":270, "width":250,
		"height":25, "rotation":0},
	{"type":"box","x":500,"y":250,"width":65,"height":15,
		"rotation":-10},
	{"type":"box","x":600,"y":225,"width":80,"height":15,
		"rotation":-20},
	{"type":"box","x":950,"y":225,"width":80,"height":15,
		"rotation":20},
	{"type":"box","x":1100,"y":250,"width":100,"height":15,
		"rotation":0},
	{"type":"win","x":1200,"y":215,"width":15,"height":25,
		"rotation":0}];

carGame.levels[1] = [{"type":"car","x":50,"y":315,"fuel":20},
	{"type":"box","x":170, "y":360, "width":250,
		"height":15, "rotation":0},
	{"type":"box","x":510, "y":340, "width":110, "height":15,
		"rotation":-10},
	{"type":"box","x":666,"y":285,"width":80,"height":15,
		"rotation":-32},
	{"type":"box","x":950,"y":230,"width":80,"height":15,
		"rotation":20},
	{"type":"box","x":1100,"y":250,"width":100,"height":15,
		"rotation":0},
	{"type":"win","x":1200,"y":215,"width":15,"height":25,
		"rotation":0}];

carGame.levels[2] = [{"type":"car","x":50,"y":315,"fuel":20},
	{"type":"box","x":160, "y":360, "width":160,
		"height":15, "rotation":0},
	{"type":"box","x":530, "y":355, "width":95,
		"height":15, "rotation":-14},
	{"type":"box","x":686,"y":285,"width":80,"height":15,
		"rotation":-32},
	{"type":"box","x":1030,"y":250,"width":165,"height":15,
		"rotation":7},
	{"type":"box","x":1150,"y":540,"width":50,"height":15,
		"rotation":0},
	{"type":"win","x":1150,"y":505,"width":15,"height":25,
		"rotation":0}];
		
carGame.levels[3] = [{"type":"car","x":50,"y":200,"fuel":20},
	{"type":"box","x":160, "y":300, "width":170,
		"height":15, "rotation":20},
	{"type":"box","x":380, "y":330, "width":95,
		"height":15, "rotation":-11},
	{"type":"box","x":676,"y":295,"width":80,"height":15,
		"rotation":-32},
	{"type":"box","x":945,"y":305,"width":80,"height":15,
		"rotation":15},
	{"type":"box","x":1100,"y":325,"width":100,"height":15,
		"rotation":0},
	{"type":"box", "x":800,"y":440,"width":30,"height":15,
		"rotation":0},
	{"type":"win","x":800,"y":405,"width":15,"height":25,
		"rotation":0}];
		
carGame.levels[4] = [{"type":"car","x":50,"y":200,"fuel":20},
	{"type":"box","x":160, "y":300, "width":170,
		"height":15, "rotation":20},
	{"type":"box","x":380, "y":330, "width":95,
		"height":15, "rotation":-11},
	{"type":"box","x":686,"y":305,"width":80,"height":15,
		"rotation":-32},
	{"type":"box","x":235,"y":505,"width":85,"height":15,
		"rotation":37},
	{"type":"box","x":500,"y":555,"width":200,"height":15,
		"rotation":0},
	{"type":"box", "x":50,"y":490,"width":30,"height":15,
		"rotation":0},
	{"type":"win","x":50,"y":455,"width":15,"height":25,
		"rotation":0}];
	
$(function()
{
	// Keyboard event
	$(document).keydown(function(e)
	{
		switch(e.keyCode)
		{
			case 88: // x key to apply force towards right
				if (carGame.fuel > 0)
				{
					var force = new b2Vec2(10000000, 0);
					car.ApplyForce(force, car.GetCenterPosition());
					carGame.fuel--;
					$(".fuel.value").width(carGame.fuel / carGame.fuelMax * 100 + '%');
				}
				break;
			case 90: // z key to apply force towards left
				if (carGame.fuel > 0)
				{
					var force = new b2Vec2(-10000000, 0);
					car.ApplyForce(force, car.GetCenterPosition());
					carGame.fuel--;
					$(".fuel-value").width(carGame.fuel / carGame.fuelMax * 100 + '%');
				}
				break;
			case 82: // r key to restart the game
				restartGame(carGame.currentLevel);
				break;
		}
	});
	
	// set the game state as "starting screen"
	carGame.state = carGame.STATE_STARTING_SCREEN;
	// start the game when clicking anywhere in starting screen
	$('#game').click(function()
	{
		if (carGame.state == carGame.STATE_STARTING_SCREEN)
		{
			$("#help").fadeOut();
			// change the state to playing.
			carGame.state = carGame.STATE_PLAYING;
			// start new game
			restartGame(carGame.currentLevel);
			// start advancing the step
			step();
		}
	});
	
	restartGame(carGame.currentLevel);
	
	// get the reference of the context
	canvas = document.getElementById('game');
	ctx = canvas.getContext('2d');
	canvasWidth = parseInt(canvas.width);
	canvasHeight = parseInt(canvas.height);
	// draw the world
	drawWorld(carGame.world, ctx);
});

function createWorld()
{
	// set the size of the world
	var worldAABB = new b2AABB();
	worldAABB.minVertex.Set(-4000, -4000);
	worldAABB.maxVertex.Set(4000, 4000);
	// Define the gravity
	var gravity = new b2Vec2(0, 300);
	// set to ignore sleeping object
	var doSleep = false;
	// finally create the world with the size, gravity, and sleep object parameter
	var world = new b2World(worldAABB, gravity, doSleep);
	return world;
}

/*
function createGround()
{
	// box shape definition
	var groundSd = new b2BoxDef();
	groundSd.extents.Set(250, 25);
	groundSd.restitution = 0.4;
	// body definition with the given shape we just created
	var groundBd = new b2BodyDef();
	groundBd.AddShape(groundSd);
	groundBd.position.Set(250, 370);
	var body = carGame.world.CreateBody(groundBd);
	return body;
}
*/

function createGround(x, y, width, height, rotation, type)
{
	// box shape definition
	var groundSd = new b2BoxDef();
	groundSd.extents.Set(width, height);
	groundSd.restitution = 0.4;
	if (type == "win")
	{
		groundSd.userData = document.getElementById('flag');
	}
	// body definition with the given shape we just created.
	var groundBd = new b2BodyDef();
	groundBd.AddShape(groundSd);
	groundBd.position.Set(x, y);
	groundBd.rotation = rotation * Math.PI / 180;
	
	var body = carGame.world.CreateBody(groundBd);
	return body;
}

/*
function CreateBox()
{
	// create a box
	var boxSd = new b2BoxDef();
	boxSd.density = 1.0;
	boxSd.friction = 1.5;
	boxSd.restitution = .4;
	boxSd.extents.Set(40, 20);

	var boxBd = new b2BodyDef();
	boxBd.AddShape(boxSd);
	boxBd.position.Set(50,210);
	carGame.world.CreateBody(boxBd);
	
	// create two wheels in the world
	createWheel(carGame.world, 25, 230);
	createWheel(carGame.world, 75, 230);
}
*/

// drawing functions
function drawWorld(world, context)
{
	for (var b = world.m_bodyList; b != null; b = b.m_next)
	{
		for (var s = b.GetShapeList(); s != null; s = s.GetNext())
		{
			if (s.GetUserData() != undefined)
			{
				// the user data contains the reference to the image
				var img = s.GetUserData();
				// the x and y of the image.
				// We have to substract the half width/height
				var x = s.GetPosition().x;
				var y = s.GetPosition().y;
				var topleftX = - $(img).width()/2;
				var topleftY = - $(img).height()/2;
				context.save();
				context.translate(x,y);
				context.rotate(s.GetBody().GetRotation());
				context.drawImage(img, topleftX, topleftY);
				context.restore();
			}
			// for debugging only
			/*
			else
			{
				drawShape(s, context);
			}
			*/
		}
	}
}
				
// drawShape function directly copy from draw_world.js in Box2dJS library
function drawShape(shape, context)
{
	context.strokeStyle = '#003300';
	context.beginPath();
	switch (shape.m_type)
	{
		case b2Shape.e_circleShape:
		// Draw the circle in canvas bases on the physics object shape
			var circle = shape;
			var pos = circle.m_position;
			var r = circle.m_radius;
			var segments = 16.0;
			var theta = 0.0;
			var dtheta = 2.0 * Math.PI / segments;
			// draw circle
			context.moveTo(pos.x + r, pos.y);
			for (var i = 0; i < segments; i++)
			{
				var d = new b2Vec2(r * Math.cos(theta), r * Math.sin(theta));
				var v = b2Math.AddVV(pos, d);
				context.lineTo(v.x, v.y);
				theta += dtheta;
			}
			context.lineTo(pos.x + r, pos.y);
			// draw radius
			context.moveTo(pos.x, pos.y);
			var ax = circle.m_R.col1;
			var pos2 = new b2Vec2(pos.x + r * ax.x, pos.y + r * ax.y);
			context.lineTo(pos2.x, pos2.y);
			break;
			
		case b2Shape.e_polyShape:
			// Draw the polygon in canvas bases on the physics object shape
			var poly = shape;
			var tV = b2Math.AddVV(poly.m_position, b2Math.b2MulMV(poly.m_R, poly.m_vertices[0]));
			context.moveTo(tV.x, tV.y);
			for (var i = 0; i < poly.m_vertexCount; i++)
			{
				var v = b2Math.AddVV(poly.m_position, b2Math.b2MulMV(poly.m_R, poly.m_vertices[i]));
				context.lineTo(v.x, v.y);
			}
			context.lineTo(tV.x, tV.y);
			break;
	}
	context.stroke();
}

function step()
{
	carGame.world.Step(1.0/60, 1);
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	drawWorld(carGame.world, ctx);
	setTimeout(step, 10);
	
	//loop all contact list to check if the car hits the winning wall
	for (var cn = carGame.world.GetContactList(); cn != null;
		cn = cn.GetNext())
	{
		var body1 = cn.GetShape1().GetBody();
		var body2 = cn.GetShape2().GetBody();
		if ((body1 == car && body2 == carGame.gamewinWall) ||
			(body2 == car && body1 == carGame.gamewinWall))
		{
			if (carGame.currentLevel < 4)
			{
				restartGame(carGame.currentLevel+1);
			}
			else
			{
				// show game over screen
				$('#game').removeClass().addClass('gamebg_won');
				$('#fuel').fadeOut();
				$('#level').fadeOut();
				// clear the physics world
				carGame.world = createWorld();
			}
		}
	}
}

function createWheel(world, x, y)
{
	// wheel circle definition
	var ballSd = new b2CircleDef();
	ballSd.density = 1.0;
	ballSd.radius = 10;
	ballSd.restitution = 0.1;
	ballSd.friction = 4.3;
	ballSd.userData = document.getElementById('wheel');
	// body definition
	var ballBd = new b2BodyDef();
	ballBd.AddShape(ballSd);
	ballBd.position.Set(x,y);
	return world.CreateBody(ballBd);
}

function createCarAt(x, y)
{
	// the car box definition
	var boxSd = new b2BoxDef();
	boxSd.density = 1.0;
	boxSd.friction = 1.5;
	boxSd.restitution = .4;
	boxSd.extents.Set(40, 20);
	boxSd.userData = document.getElementById('bus');
	// the car body definition
	var boxBd = new b2BodyDef();
	boxBd.AddShape(boxSd);
	boxBd.position.Set(x,y);
	var carBody = carGame.world.CreateBody(boxBd);
	// creating the wheels
	var wheelBody1 = createWheel(carGame.world, x-25, y+20);
	var wheelBody2 = createWheel(carGame.world, x+25, y+20);
	// create a joint to connect left wheel with the car body
	var jointDef = new b2RevoluteJointDef();
	jointDef.anchorPoint.Set(x-25, y+20);
	jointDef.body1 = carBody;
	jointDef.body2 = wheelBody1;
	carGame.world.CreateJoint(jointDef);
	// create a joint to connect right wheel with the car body
	var jointDef = new b2RevoluteJointDef();
	jointDef.anchorPoint.Set(x+25, y+20);
	jointDef.body1 = carBody;
	jointDef.body2 = wheelBody2;
	carGame.world.CreateJoint(jointDef);
	return carBody;
}

function restartGame(level)
{
	carGame.currentLevel = level;
	// create the world
	carGame.world = createWorld();
	// create a ground in our newly created world
	// load the ground info from level data
	for(var i=0;i<carGame.levels[level].length;i++)
	{
		var obj = carGame.levels[level][i];
		// create car
		if (obj.type == "car")
		{
			car = createCarAt(obj.x,obj.y);
			carGame.fuel = obj.fuel;
			carGame.fuelMax = obj.fuel;
			$(".fuel-value").width('100%');
			continue;
		}
		var groundBody = createGround(obj.x, obj.y, obj.width,
			obj.height, obj.rotation, obj.type);
		if (obj.type == "win")
		{
			carGame.gamewinWall = groundBody;
		}
	}
	$("#level").html("Level " + (level+1));
	// change the background image to fit the level
	$('#game').removeClass().addClass('gamebg_level'+level);
}

