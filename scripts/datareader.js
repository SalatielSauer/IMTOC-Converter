const imtoc_data_readers = [
    {
        "name": "IMTOC Default",
        "author": "SalatielSauer",
        "url": "https://github.com/SalatielSauer/",
        "body": `
// CUBESCRIPT DATA READER
// VARIABLES: $_IMTOC_delay, $_IMTOC_DATA, $_IMTOC_PIXEL, $_IMTOC_INDEX, $_IMTOC_WIDTH, $_IMTOC_HEIGHT, $_IMTOC_FILENAME
// EVENTS: _IMTOC_oncolumn, _IMTOC_onrow, _IMTOC_onexec, _IMTOC_onend
// COMMANDS: _IMTOC_draw

// Pixel drawing speed
_IMTOC_delay = 0.1

// Executes for every column:
_IMTOC_oncolumn = [
	movesel 1 0 // move selection to the right
	if (!=s $_IMTOC_PIXEL "0x000000") [ // ignores black background
		paste
		vcolor $arg1 $arg2 $arg3 // arguments contains R G B colors
	]
]

// Executes for every row:
_IMTOC_onrow = [
	movesel (* $_IMTOC_WIDTH -1) 0 // move selection back to start
	movesel 1 1 // move selection down
]

// Executes on file load (/exec)
_IMTOC_onexec = [
	echo (concat "^f8Drawing^f0" $_IMTOC_FILENAME)
	_IMTOC_DRAW // start drawing
]

// Executes when drawing is complete
_IMTOC_onend = [
	echo "^f8Image is finished"
]`},
    {
        "name": "IMTOC HeightMap",
        "author": "SalatielSauer",
        "url": "https://github.com/SalatielSauer/",
        "body": `
_IMTOC_delay = 0
_IMTOC_COLORHEIGHT = [
	floor (divf (*f (+f (+f (*f 0.2126 $arg1) (*f 0.7152 $arg2)) (*f 0.0722 $arg3)) (*f $arg4 100)) 10)
]
_IMTOC_oncolumn = [
	local colorHeight
	colorHeight = (_IMTOC_COLORHEIGHT $arg1 $arg2 $arg3 3)
	movesel 1 0
	loop z $colorHeight [
		sleep (*f $z 10) [
			_IMTOC_delay = (+f 10 (*f @colorHeight 10))
			movesel 1 2
			paste
			vcolor @arg1 @arg2 @arg3
			if (= @z (- @colorHeight 1)) [
				movesel (* @@colorHeight -1) 2
			]
		]
	]
]
_IMTOC_onrow = [
	movesel (* $_IMTOC_WIDTH -1) 0
	movesel 1 1
]
_IMTOC_onexec = [
	echo (concat "^f8Drawing Heightmap^f0" $_IMTOC_FILENAME)
	_IMTOC_DRAW
]
_IMTOC_onend = [
	echo "^f8Heightmap Image is finished"
]`
    }
]