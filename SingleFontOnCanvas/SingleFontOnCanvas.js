function SingleFontOnCanvas(typeface, letter, assets){

    let defaults = {
        position: { x: 0, y: 0 },
        weight: 0,
        scale: 1,
        alignment: "left",
        sticky: "top",
        color: "#ffffff",
        line_height: 1,
        tracking: 0,
        kerning: 0,
        stroke_width: 0,
        stroke_style: "#ffffff",
        structure_width: 0,
        structure_style: "#ffffff"
    };

    
    for (const prop in defaults) {
        if (assets[prop] === undefined) {
            assets[prop] = defaults[prop];
        }
    }
    


    
    //  finding the letter index using unicode of the each letter
    let index_con = [];

    for(let i = 0; i < letter.length; i++){
        for(let j = 0; j < Object.entries(typeface.letters.info).length; j++){
            if(letter[i].charCodeAt() == typeface.letters.info[j].unicode){
                index_con[i] = j;
            }
        }
    }



    //  Organizing the info
    //  typeface_path_con contains ALL nodes or points {x: 285, y: 715, in_x: 285, in_y: 715, out_x: 285, …}
    //  typeface_info_con contains general letter info {advanceWidth: 588, index: 12, leftSideBearing: 10, name: "A"}
    let typeface_path_con = [];
    let typeface_info_con = [];

    for(let i = 0; i < letter.length; i++){
        typeface_path_con[i] = [];
        typeface_info_con[i] = [];
    }

    for(let i = 0; i < letter.length; i++){
            typeface_path_con[i] = structuredClone(typeface.letters.path[index_con[i]]);
            typeface_info_con[i] = structuredClone(typeface.letters.info[index_con[i]]);
    }



    //  Similar to typeface_path_con, letter_path_con containers points but ONLY for the selected letters
    let letter_path_con = [];

    for(let i = 0; i < letter.length; i++){
        letter_path_con[i] = structuredClone(typeface_path_con[i][assets.weight]);
    }

    

    let structure_con = [];


    for(let i = 0; i < letter.length; i++){
        structure_con[i] = [];
    }

    
    for(let i = 0; i < letter.length; i++){
        structure_con[i] = {
            point_0: {x: 0, y: 0}, 
            point_1: {x: typeface_info_con[i].advanceWidth, y: 0}, 
            point_2: {x: typeface_info_con[i].advanceWidth, y: -(typeface.parameters.descender - typeface.parameters.ascender)}, 
            point_3: {x: 0, y: -(typeface.parameters.descender - typeface.parameters.ascender)},
                    
            base_0: {x: 0, y:  typeface.parameters.ascender},
            base_1: {x: typeface_info_con[i].advanceWidth, y : typeface.parameters.ascender}
        }
    }



    let width_con = [];
    let updated_width_con = [];
    let pos_y_align = [];


    for(let i = 0; i < letter.length; i++){
        updated_width_con[i] = 0;
    }





    this.draw = function(){





        for(let i = 0; i < letter.length; i++){
            width_con[i] = (structure_con[i].point_1.x - structure_con[i].point_0.x) * assets.scale;
        }

        let total_width = sumArray(width_con);

        // Text Alignment
        // might be able to take out of draw function if scale don't change in motion
        if(assets.alignment == 'center'){
            for(let i = 0; i < letter.length; i++){
                text_alignment = assets.position.x - (total_width / 2);
            }
        }else if(assets.alignment == 'left'){
            for(let i = 0; i < letter.length; i++){
                text_alignment = assets.position.x;
            }
        }else if(assets.alignment == 'right'){
            for(let i = 0; i < letter.length; i++){
                text_alignment = assets.position.x - total_width;
            }
        }

        


        // might be able to take out of draw function if scale don't change in motion
        if(assets.sticky == 'bottom'){
            for(let i = 0; i < letter.length; i++){
                pos_y_align[i] = - ((typeface[0].parameters.ascender - typeface[0].parameters.descender) * assets.scale);
            }
        }else{
            for(let i = 0; i < letter.length; i++){
                pos_y_align[i] = 0;
            }
        }


        

        // Variable to store the cumulative sum
        let cumulativeSum = 0;

        // Loop through the original array starting from index 1
        for (let i = 0; i < width_con.length; i++) {
            cumulativeSum += width_con[i];
            updated_width_con[i + 1] = cumulativeSum;
        }




        if(assets.structure_width !== 0){
            for(let i = 0; i < letter.length; i++){

                ctx.beginPath();
                ctx.moveTo((structure_con[i].point_0.x * assets.scale) + updated_width_con[i] + text_alignment, (structure_con[i].point_0.y * assets.scale) + assets.position.y + pos_y_align[i]);
                ctx.lineTo((structure_con[i].point_1.x * assets.scale) + updated_width_con[i] + text_alignment, (structure_con[i].point_1.y * assets.scale) + assets.position.y + pos_y_align[i]);
                ctx.lineTo((structure_con[i].point_2.x * assets.scale) + updated_width_con[i] + text_alignment, (structure_con[i].point_2.y * assets.scale) + assets.position.y + pos_y_align[i]);
                ctx.lineTo((structure_con[i].point_3.x * assets.scale) + updated_width_con[i] + text_alignment, (structure_con[i].point_3.y * assets.scale) + assets.position.y + pos_y_align[i]);
                
                ctx.lineTo((structure_con[i].point_0.x * assets.scale) + updated_width_con[i] + text_alignment, (structure_con[i].point_0.y * assets.scale) + assets.position.y + pos_y_align[i]);

                ctx.strokeStyle = assets.structure_style;
                ctx.lineWidth = assets.structure_width;
                ctx.stroke();

                ctx.closePath();


                ctx.beginPath();
                ctx.moveTo((structure_con[i].base_0.x * assets.scale) + updated_width_con[i] + text_alignment, (structure_con[i].base_0.y * assets.scale) + assets.position.y + pos_y_align[i]);
                ctx.lineTo((structure_con[i].base_1.x * assets.scale) + updated_width_con[i] + text_alignment, (structure_con[i].base_1.y * assets.scale) + assets.position.y + pos_y_align[i]);

                ctx.strokeStyle = assets.structure_style;
                ctx.lineWidth = assets.structure_width;
                ctx.stroke();

                ctx.closePath();

            }
        }



        // ---------------------------------------------------------------------------------------------------------------------------------- //




        ctx.beginPath();

        
        for(let i = 0; i < letter.length; i++){
            for(let j = 0; j < typeface_path_con[i].length; j++){

                    ctx.moveTo((typeface_path_con[i][j][0].x * assets.scale) + updated_width_con[i] + text_alignment, ((-typeface_path_con[i][j][0].y + typeface.parameters.ascender) * assets.scale) + assets.position.y + pos_y_align[i]); 

                    for(let k = 0; k < typeface_path_con[i][j].length - 1; k++){
                        ctx.bezierCurveTo(
                            (typeface_path_con[i][j][k].out_x * assets.scale) + updated_width_con[i] + text_alignment, ((-typeface_path_con[i][j][k].out_y + typeface.parameters.ascender) * assets.scale) + assets.position.y + pos_y_align[i],
                            (typeface_path_con[i][j][k + 1].in_x * assets.scale) + updated_width_con[i] + text_alignment, ((-typeface_path_con[i][j][k + 1].in_y + typeface.parameters.ascender) * assets.scale) + assets.position.y + pos_y_align[i],
                            (typeface_path_con[i][j][k + 1].x * assets.scale) + updated_width_con[i] + text_alignment, ((-typeface_path_con[i][j][k + 1].y + typeface.parameters.ascender) * assets.scale) + assets.position.y + pos_y_align[i]
                        );
                    }

                    ctx.bezierCurveTo(
                        (typeface_path_con[i][j][typeface_path_con[i][j].length - 1].out_x * assets.scale) + updated_width_con[i] + text_alignment, ((-typeface_path_con[i][j][typeface_path_con[i][j].length - 1].out_y + typeface.parameters.ascender) * assets.scale) + assets.position.y + pos_y_align[i],
                        (typeface_path_con[i][j][0].in_x * assets.scale) + updated_width_con[i] + text_alignment, ((-typeface_path_con[i][j][0].in_y + typeface.parameters.ascender) * assets.scale) + assets.position.y + pos_y_align[i],
                        (typeface_path_con[i][j][0].x * assets.scale) + updated_width_con[i] + text_alignment, ((-typeface_path_con[i][j][0].y + typeface.parameters.ascender) * assets.scale) + assets.position.y + pos_y_align[i]
                    );

                    ctx.lineTo((typeface_path_con[i][j][0].x * assets.scale) + updated_width_con[i] + text_alignment, ((-typeface_path_con[i][j][0].y + typeface.parameters.ascender) * assets.scale) + assets.position.y + pos_y_align[i]);

            }
        }



        ctx.fillStyle = assets.color;
        ctx.fill();
        ctx.strokeStyle = assets.stroke_style;
        ctx.lineWidth = assets.stroke_width;
        ctx.stroke();
        ctx.closePath();

        
    }



    function sumArray(arr) {

        let sum = 0;

        for (let i = 0; i < arr.length; i++) {
            sum += arr[i];
        }

        return sum;

    }



}