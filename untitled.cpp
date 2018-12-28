
//data reader by RaZgRiZ 
.img_w = $imtoc_imagew
.img_h = $imtoc_imageh
.pixeldat = $imtoc_colordata

loadimg = [
    if $numargs [
        exec (concatword $arg1 ".cfg")
        .pixelidx = 0
        .totalpxl = (* $.img_w $.img_h)
        .drawalpha = (|| [< $numargs 2] $arg2)
        echo (concatword "^f7Loaded <^f3" $arg1 "^f7>")
    ] [ echo "^f7You need to specify a ^f3filename^f7." ]
]

drawrow = [
    echo (format "^f7Drawing row ^f4#%1 ^f7out of ^f4%2^f7." (div $.pixelidx $.img_w) $.img_h)
    loop n $.img_w [
        sleep (* $n 10) [
            .pixelcol = (at $.pixeldat $.pixelidx)
            .pixelidx = (+ $.pixelidx 1)
            
            if $.drawalpha [
                if (>= (strlen $.pixelcol) 10)[
                    delcube
                ]
            ]

            vcolor (
                divf (& (>> $.pixelcol 0x10) 0xFF) 0xFF
            ) (
                divf (& (>> $.pixelcol 0x8) 0xFF) 0xFF
            ) (
                divf (& $.pixelcol 0xFF) 0xFF
            )

            if (= $.pixelidx $.totalpxl) [
                echo "^f0Image completed successfully."
                .pixelidx = 0
            ] [ editface -1 1 ]
        ]
    ]
]
prevrow = [
    if $arg1 [ arg1 = (* $.img_w $arg1) ] [ arg1 = $.img_w ]
    .pixelidx = (max 0 (- $.pixelidx $arg1))
    echo (concat "^f7Returning to row^f4#" (div $.pixelidx $.img_w))
]

resetdraw = [
    .pixelidx = 0
    echo "^f7Resetting to first row."
]