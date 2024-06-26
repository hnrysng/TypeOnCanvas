
function VariableFontOnCanvas(variablefont, assets, text){


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

    

    //  Making infos and variables based on the selected letters
    function text_info(){

        
        //  finding the unicode of the each letter
        let unicode_con = [];


        for(let i = 0; i < text.length; i++){
            for(let j = 0; j < Object.entries(variablefont[0].typeface.letters.info).length; j++){
                if(text[i].charCodeAt() == variablefont[0].typeface.letters.info[j].unicode){
                    unicode_con[i] = j;
                }
            }
        }


        //  organizing the info
        let text_path_con = [];
        let text_info_con = [];
        let text_structure_con = [];

        for(let i = 0; i < variablefont.length; i++){
            text_path_con[i] = [];
            text_info_con[i] = [];
            text_structure_con[i] = [];
            // text_variables[i] = {variablefont[i].variables: {Weight: 0, Italic: 0}};
            for(let j = 0; j < text.length; j++){
                text_path_con[i][j] = [];
                text_info_con[i][j] = [];
                text_structure_con[i][j] = [];
            }
        }

        for(let i = 0; i < variablefont.length; i++){
            for(let j = 0; j < text.length; j++){
                text_path_con[i][j] = variablefont[i].typeface.letters.path[unicode_con[j]];
                text_info_con[i][j] = variablefont[i].typeface.letters.info[unicode_con[j]];
                text_structure_con[i][j] = {
                    point_0: {x: 0, y: 0}, 
                    point_1: {x: text_info_con[i][j].advanceWidth, y: 0}, 
                    point_2: {x: text_info_con[i][j].advanceWidth, y: -(variablefont[i].typeface.parameters.descender - variablefont[i].typeface.parameters.ascender)}, 
                    point_3: {x: 0, y: -(variablefont[i].typeface.parameters.descender - variablefont[i].typeface.parameters.ascender)},
                            
                    base_0: {x: 0, y:  variablefont[i].typeface.parameters.ascender},
                    base_1: {x: text_info_con[i][j].advanceWidth, y : variablefont[i].typeface.parameters.ascender}
                }
            }
        }

        // Might be cleaner to use this...
        let text_variables = variablefont.map(item => item.variables);;



        // what would be the best text format?
        
        return {text_variables, text_path_con, text_info_con, text_structure_con}

    }




    let number_of_variables = Object.entries(variablefont[0].variables).length;
    let text_package = text_info();





    function find_main_axis(){

        let main_axis = {
            name: null,
            index: null,
            value: {min: null, max: null}
        }


        main_axis.name = find_main_axis_name(variablefont);

        
        for(let i = 0; i < Object.entries(text_package.text_variables[0]).length; i++){
            if(Object.entries(text_package.text_variables[0])[i][0] == main_axis.name){
                main_axis.index = i;   
            }
        }



        let min_max_finder = [];

        for(let i = 0; i < text_package.text_variables.length; i++){
            min_max_finder.push(text_package.text_variables[i][main_axis.name])
        }

        main_axis.value.min = Math.min(...min_max_finder);
        main_axis.value.max = Math.max(...min_max_finder);



        function find_main_axis_name(variablefont){


            let variables = [];

            for(let i = 0; i < variablefont.length; i++){
                variables[i] = variablefont[i].variables
            }

            // Function to count unique values for each property
            function countUniqueValues(arr) {
                const uniqueCounts = {};
                
                arr.forEach(obj => {
                    Object.keys(obj).forEach(key => {
                    if (!uniqueCounts[key]) {
                        uniqueCounts[key] = new Set();
                    }
                    uniqueCounts[key].add(obj[key]);
                    });
                });
                
                // Convert sets to counts
                for (const key in uniqueCounts) {
                    uniqueCounts[key] = uniqueCounts[key].size;
                }

                return uniqueCounts;
            }

            // Function to find the property with the most diverse values
            function findMostDiverseProperty(arr) {
            const uniqueCounts = countUniqueValues(arr);
            
            // Find the property with the highest count of unique values
            let mostDiverseProperty = null;
            let maxUniqueCount = 0;
            
            for (const key in uniqueCounts) {
                    if (uniqueCounts[key] > maxUniqueCount) {
                        maxUniqueCount = uniqueCounts[key];
                        mostDiverseProperty = key;
                    }
                }

                return mostDiverseProperty;
            }

            const mostDiverseProperty = findMostDiverseProperty(variables);

            return mostDiverseProperty;

        }

        return main_axis;

    }


    let main_axis = find_main_axis();


    


    let updated_width_con = [];
    let letter_pos_con = [];

    for(let i = 0; i < text.length; i++){
        updated_width_con[i] = 0;
        letter_pos_con[i] = {x:0, y:0};
    }


    let width_con = [];
    let pos_y_align = [];


    function interpolate(value1, value2, fraction) {
        return value1 + (value2 - value1) * fraction;
    }

    function findClosestPoints(text_package, input_variable) {



    let axis_filter = [];
    let fraction_properties = [];
    let axis_val = [];
    let element_length_finder = [];

    for(let i = 0; i < number_of_variables; i++){
        axis_filter[i] = [];
        fraction_properties[i] = {min:null, max:null};
        axis_val[i] = [];
    }
    


    for (let i = 0; i < text_package.text_variables.length; i++) {

            if(input_variable[main_axis.name] == Object.entries(text_package.text_variables[i])[main_axis.index][1] 
            && input_variable[main_axis.name] == main_axis.value.min){
                    axis_filter[main_axis.index].push({
                        index: i,
                        variable: text_package.text_variables[i],
                        path: text_package.text_path_con[i],
                        structure: text_package.text_structure_con[i]
                    })
                    axis_filter[main_axis.index].push({
                        index: i + 1,
                        variable: text_package.text_variables[i + 1],
                        path: text_package.text_path_con[i + 1],
                        structure: text_package.text_structure_con[i + 1]
                    })
            }else if(input_variable[main_axis.name] == Object.entries(text_package.text_variables[i])[main_axis.index][1] 
            && input_variable[main_axis.name] == main_axis.value.max){
                    axis_filter[main_axis.index].push({
                        index: i - 1,
                        variable: text_package.text_variables[i - 1],
                        path: text_package.text_path_con[i - 1],
                        structure: text_package.text_structure_con[i - 1]
                    })
                    axis_filter[main_axis.index].push({
                        index: i,
                        variable: text_package.text_variables[i],
                        path: text_package.text_path_con[i],
                        structure: text_package.text_structure_con[i]
                    })
            }
            else if(input_variable[main_axis.name] >= Object.entries(text_package.text_variables[i])[main_axis.index][1] 
            && input_variable[Object.entries(text_package.text_variables[0])[main_axis.index][0]] < Object.entries(text_package.text_variables[i + 1])[main_axis.index][1]){

                axis_filter[main_axis.index].push({
                    index: i,
                    variable: text_package.text_variables[i],
                    path: text_package.text_path_con[i],
                    structure: text_package.text_structure_con[i]
                })


                axis_filter[main_axis.index].push({
                    index: i + 1,
                    variable: text_package.text_variables[i + 1],
                    path: text_package.text_path_con[i + 1],
                    structure: text_package.text_structure_con[i + 1]
                })   

            }

    }




    for(let i = 0; i < number_of_variables; i++){
        element_length_finder.push(axis_filter[i].length)
    }


    //only make it with main_axis_index, and use min_val and max_val to filter out the arrs.
    let axis = axis_filter[main_axis.index];
    
    // console.log(axis)


    for(let i = 0; i < axis_filter[main_axis.index].length; i++){
        for(let j = 0; j < number_of_variables; j++){
            axis_val[j].push(Object.entries(axis_filter[main_axis.index][i].variable)[j][1])
        }
    }
    
    for(let i = 0; i < number_of_variables; i++){
        fraction_properties[i].min = Math.min(...axis_val[i]);
        fraction_properties[i].max = Math.max(...axis_val[i]);
    }



    function groupByKeysToArray(arr, keys) {
        let map = new Map();

        arr.forEach(item => {
            let group = map;
            keys.forEach((key, index) => {
                const value = item.variable[key];
                if (index === keys.length - 1) {
                    if (!group.has(value)) {
                        group.set(value, []);
                    }
                    group.get(value).push(item);
                } else {
                    if (!group.has(value)) {
                        group.set(value, new Map());
                    }
                    group = group.get(value);
                }
            });
        });

        function mapToArray(map) {
            let result = [];
            map.forEach((value, key) => {
                if (value instanceof Map) {
                    result = result.concat(mapToArray(value));
                } else {
                    result.push(value);
                }
            });
            return result;
        }

        return mapToArray(map);
    }








    let filter = [];

    for(let i = 0; i < number_of_variables - 1; i++){
        filter.push(Object.entries(axis[0].variable)[i][0])
    }


    let groupedaxis = groupByKeysToArray(axis, [filter]);

    // let groupedaxis_1 = groupByKeysToArray_1(axis, [filter]);
    
    // console.log(axis)
    // console.log(groupedaxis)

    // asdf
    let axis_calc_order = [];

    for(let i = number_of_variables - 1; i >= 0; i--){
        axis_calc_order.push(Object.entries(axis[0].variable)[i][0])
    }



    return {axis, groupedaxis, fraction_properties, axis_calc_order};

}



let variable_max_val_con = [];
let variable_min_val_con = [];

    for(let i = 0; i < Object.entries(variblefont[0].variables).length; i++){
        variable_max_val_con[i] = 0;
        variable_min_val_con[i] = 0;
    }

    for(let i = 0; i < variablefont.length; i++){
        for(let j = 0; j < Object.entries(variblefont[i].variables).length; j++){
            if(Object.entries(variblefont[i].variables)[j][1] > variable_max_val_con[j]){
                variable_max_val_con[j] = Object.entries(variblefont[i].variables)[j][1]
            }
            if(Object.entries(variblefont[i].variables)[j][1] < variable_min_val_con[j]){
                variable_min_val_con[j] = Object.entries(variblefont[i].variables)[j][1]
            }
        }
    }


    
    function get_num_of_array_to_calc(num_of_axis) {
        let result = [];
        while (num_of_axis >= 1) {
            result.push(num_of_axis);
            num_of_axis = Math.floor(num_of_axis / 2);
        }
        return result;
    }

                            
    function make_placeholder_arrays_to_calc(num_of_array_to_calc_path, structure_to_clone) {
        return num_of_array_to_calc_path.map(size => {
            let nestedArray = [];
            for (let i = 0; i < size; i++) {
                nestedArray.push(structuredClone(structure_to_clone));
            }
            return nestedArray;
        });
    }

    let num_of_array_to_calc_path = get_num_of_array_to_calc(number_of_variables);
    let placeholder_arrays_to_calc_path = make_placeholder_arrays_to_calc(num_of_array_to_calc_path, text_package.text_path_con[0]);
    let placeholder_arrays_to_calc_structure = make_placeholder_arrays_to_calc(num_of_array_to_calc_path, text_package.text_structure_con[0]);
    

    function calc_test(inputVariables){


    for(let i = 0; i < variable_max_val_con.length; i++){
        if(inputVariables[Object.keys(inputVariables)[i]] > variable_max_val_con[i]){
            inputVariables[Object.keys(inputVariables)[i]] = variable_max_val_con[i];
        }

        if(inputVariables[Object.keys(inputVariables)[i]] < variable_min_val_con[i]){
            inputVariables[Object.keys(inputVariables)[i]] = variable_min_val_con[i];
        }
    }


    let closet_axis = findClosestPoints(text_package, inputVariables)

    let fraction_con = structuredClone(inputVariables);

    for (let i = 0; i < Object.entries(inputVariables).length; i++){
        fraction_con[Object.keys(fraction_con)[i]] = (Object.entries(inputVariables)[i][1] - closet_axis.fraction_properties[i].min) / (closet_axis.fraction_properties[i].max - closet_axis.fraction_properties[i].min);
    }

    




    // first iteration of filtering
    for(let a = 0; a < placeholder_arrays_to_calc_path[0].length; a++){

            for(let j = 0; j < closet_axis.groupedaxis[a][0].path.length; j++){
                for(let k = 0; k < closet_axis.groupedaxis[a][0].path[j].length; k++){
                    for(let l = 0; l < closet_axis.groupedaxis[a][0].path[j][k].length; l++){
                        placeholder_arrays_to_calc_path[0][a][j][k][l].x = interpolate(closet_axis.groupedaxis[a][0].path[j][k][l].x, closet_axis.groupedaxis[a][1].path[j][k][l].x, fraction_con[closet_axis.axis_calc_order[0]]);
                        placeholder_arrays_to_calc_path[0][a][j][k][l].y = interpolate(closet_axis.groupedaxis[a][0].path[j][k][l].y, closet_axis.groupedaxis[a][1].path[j][k][l].y, fraction_con[closet_axis.axis_calc_order[0]]);
                        placeholder_arrays_to_calc_path[0][a][j][k][l].in_x = interpolate(closet_axis.groupedaxis[a][0].path[j][k][l].in_x, closet_axis.groupedaxis[a][1].path[j][k][l].in_x, fraction_con[closet_axis.axis_calc_order[0]]);
                        placeholder_arrays_to_calc_path[0][a][j][k][l].in_y = interpolate(closet_axis.groupedaxis[a][0].path[j][k][l].in_y, closet_axis.groupedaxis[a][1].path[j][k][l].in_y, fraction_con[closet_axis.axis_calc_order[0]]);
                        placeholder_arrays_to_calc_path[0][a][j][k][l].out_x = interpolate(closet_axis.groupedaxis[a][0].path[j][k][l].out_x, closet_axis.groupedaxis[a][1].path[j][k][l].out_x, fraction_con[closet_axis.axis_calc_order[0]]);
                        placeholder_arrays_to_calc_path[0][a][j][k][l].out_y = interpolate(closet_axis.groupedaxis[a][0].path[j][k][l].out_y, closet_axis.groupedaxis[a][1].path[j][k][l].out_y, fraction_con[closet_axis.axis_calc_order[0]]);
                    }
                }
            }

    }

    // rest of the iteration
    for(let n = 1; n < placeholder_arrays_to_calc_path.length; n++){
        for(let a = 0; a < placeholder_arrays_to_calc_path[n].length; a = a + 2){
            for(let i = 0; i < placeholder_arrays_to_calc_path[n][a].length; i++){
                for(let j = 0; j < placeholder_arrays_to_calc_path[n][a][i].length; j++){
                    for(let k = 0; k < placeholder_arrays_to_calc_path[n][a][i][j].length; k++){
                        placeholder_arrays_to_calc_path[n][a][i][j][k].x = interpolate(placeholder_arrays_to_calc_path[n-1][a][i][j][k].x, placeholder_arrays_to_calc_path[n-1][a+1][i][j][k].x, fraction_con[closet_axis.axis_calc_order[n]]);
                        placeholder_arrays_to_calc_path[n][a][i][j][k].y = interpolate(placeholder_arrays_to_calc_path[n-1][a][i][j][k].y, placeholder_arrays_to_calc_path[n-1][a+1][i][j][k].y, fraction_con[closet_axis.axis_calc_order[n]]);
                        placeholder_arrays_to_calc_path[n][a][i][j][k].in_x = interpolate(placeholder_arrays_to_calc_path[n-1][a][i][j][k].in_x, placeholder_arrays_to_calc_path[n-1][a+1][i][j][k].in_x, fraction_con[closet_axis.axis_calc_order[n]]);
                        placeholder_arrays_to_calc_path[n][a][i][j][k].in_y = interpolate(placeholder_arrays_to_calc_path[n-1][a][i][j][k].in_y, placeholder_arrays_to_calc_path[n-1][a+1][i][j][k].in_y, fraction_con[closet_axis.axis_calc_order[n]]);
                        placeholder_arrays_to_calc_path[n][a][i][j][k].out_x = interpolate(placeholder_arrays_to_calc_path[n-1][a][i][j][k].out_x, placeholder_arrays_to_calc_path[n-1][a+1][i][j][k].out_x, fraction_con[closet_axis.axis_calc_order[n]]);
                        placeholder_arrays_to_calc_path[n][a][i][j][k].out_y = interpolate(placeholder_arrays_to_calc_path[n-1][a][i][j][k].out_y, placeholder_arrays_to_calc_path[n-1][a+1][i][j][k].out_y, fraction_con[closet_axis.axis_calc_order[n]]);
                    }
                }
            }
        }
    }



    // first iteration of filtering
    for(let i = 0; i < placeholder_arrays_to_calc_structure[0].length; i++){
            for(let j = 0; j < closet_axis.groupedaxis[i][0].structure.length; j++){

                        placeholder_arrays_to_calc_structure[0][i][j].point_0.x = interpolate(closet_axis.groupedaxis[i][0].structure[j].point_0.x, closet_axis.groupedaxis[i][1].structure[j].point_0.x, fraction_con[closet_axis.axis_calc_order[0]]);
                        placeholder_arrays_to_calc_structure[0][i][j].point_0.y = interpolate(closet_axis.groupedaxis[i][0].structure[j].point_0.y, closet_axis.groupedaxis[i][1].structure[j].point_0.y, fraction_con[closet_axis.axis_calc_order[0]]);
                        placeholder_arrays_to_calc_structure[0][i][j].point_1.x = interpolate(closet_axis.groupedaxis[i][0].structure[j].point_1.x, closet_axis.groupedaxis[i][1].structure[j].point_1.x, fraction_con[closet_axis.axis_calc_order[0]]);
                        placeholder_arrays_to_calc_structure[0][i][j].point_1.y = interpolate(closet_axis.groupedaxis[i][0].structure[j].point_1.y, closet_axis.groupedaxis[i][1].structure[j].point_1.y, fraction_con[closet_axis.axis_calc_order[0]]);
                        placeholder_arrays_to_calc_structure[0][i][j].point_2.x = interpolate(closet_axis.groupedaxis[i][0].structure[j].point_2.x, closet_axis.groupedaxis[i][1].structure[j].point_2.x, fraction_con[closet_axis.axis_calc_order[0]]);
                        placeholder_arrays_to_calc_structure[0][i][j].point_2.y = interpolate(closet_axis.groupedaxis[i][0].structure[j].point_2.y, closet_axis.groupedaxis[i][1].structure[j].point_2.y, fraction_con[closet_axis.axis_calc_order[0]]);
                        placeholder_arrays_to_calc_structure[0][i][j].point_3.x = interpolate(closet_axis.groupedaxis[i][0].structure[j].point_3.x, closet_axis.groupedaxis[i][1].structure[j].point_3.x, fraction_con[closet_axis.axis_calc_order[0]]);
                        placeholder_arrays_to_calc_structure[0][i][j].point_3.y = interpolate(closet_axis.groupedaxis[i][0].structure[j].point_3.y, closet_axis.groupedaxis[i][1].structure[j].point_3.y, fraction_con[closet_axis.axis_calc_order[0]]);
                        placeholder_arrays_to_calc_structure[0][i][j].base_0.x = interpolate(closet_axis.groupedaxis[i][0].structure[j].base_0.x, closet_axis.groupedaxis[i][1].structure[j].base_0.x, fraction_con[closet_axis.axis_calc_order[0]]);
                        placeholder_arrays_to_calc_structure[0][i][j].base_0.y = interpolate(closet_axis.groupedaxis[i][0].structure[j].base_0.y, closet_axis.groupedaxis[i][1].structure[j].base_0.y, fraction_con[closet_axis.axis_calc_order[0]]);
                        placeholder_arrays_to_calc_structure[0][i][j].base_1.x = interpolate(closet_axis.groupedaxis[i][0].structure[j].base_1.x, closet_axis.groupedaxis[i][1].structure[j].base_1.x, fraction_con[closet_axis.axis_calc_order[0]]);
                        placeholder_arrays_to_calc_structure[0][i][j].base_1.y = interpolate(closet_axis.groupedaxis[i][0].structure[j].base_1.y, closet_axis.groupedaxis[i][1].structure[j].base_1.y, fraction_con[closet_axis.axis_calc_order[0]]);

            }
    }
    
    // rest of the iteration
    for(let i = 1; i < placeholder_arrays_to_calc_structure.length; i++){
            for(let j = 0; j < placeholder_arrays_to_calc_structure[i].length; j++){
                for(let k = 0; k < placeholder_arrays_to_calc_structure[i][j].length; k++){

                        placeholder_arrays_to_calc_structure[i][j][k].point_0.x = interpolate(placeholder_arrays_to_calc_structure[i-1][j][k].point_0.x, placeholder_arrays_to_calc_structure[i-1][j+1][k].point_0.x, fraction_con[closet_axis.axis_calc_order[i-1]]);
                        placeholder_arrays_to_calc_structure[i][j][k].point_0.y = interpolate(placeholder_arrays_to_calc_structure[i-1][j][k].point_0.y, placeholder_arrays_to_calc_structure[i-1][j+1][k].point_0.y, fraction_con[closet_axis.axis_calc_order[i-1]]);
                        placeholder_arrays_to_calc_structure[i][j][k].point_1.x = interpolate(placeholder_arrays_to_calc_structure[i-1][j][k].point_1.x, placeholder_arrays_to_calc_structure[i-1][j+1][k].point_1.x, fraction_con[closet_axis.axis_calc_order[i-1]]);
                        placeholder_arrays_to_calc_structure[i][j][k].point_1.y = interpolate(placeholder_arrays_to_calc_structure[i-1][j][k].point_1.y, placeholder_arrays_to_calc_structure[i-1][j+1][k].point_1.y, fraction_con[closet_axis.axis_calc_order[i-1]]);
                        placeholder_arrays_to_calc_structure[i][j][k].point_2.x = interpolate(placeholder_arrays_to_calc_structure[i-1][j][k].point_2.x, placeholder_arrays_to_calc_structure[i-1][j+1][k].point_2.x, fraction_con[closet_axis.axis_calc_order[i-1]]);
                        placeholder_arrays_to_calc_structure[i][j][k].point_2.y = interpolate(placeholder_arrays_to_calc_structure[i-1][j][k].point_2.y, placeholder_arrays_to_calc_structure[i-1][j+1][k].point_2.y, fraction_con[closet_axis.axis_calc_order[i-1]]);
                        placeholder_arrays_to_calc_structure[i][j][k].point_3.x = interpolate(placeholder_arrays_to_calc_structure[i-1][j][k].point_3.x, placeholder_arrays_to_calc_structure[i-1][j+1][k].point_3.x, fraction_con[closet_axis.axis_calc_order[i-1]]);
                        placeholder_arrays_to_calc_structure[i][j][k].point_3.y = interpolate(placeholder_arrays_to_calc_structure[i-1][j][k].point_3.y, placeholder_arrays_to_calc_structure[i-1][j+1][k].point_3.y, fraction_con[closet_axis.axis_calc_order[i-1]]);
                        placeholder_arrays_to_calc_structure[i][j][k].base_0.x = interpolate(placeholder_arrays_to_calc_structure[i-1][j][k].base_0.x, placeholder_arrays_to_calc_structure[i-1][j+1][k].base_0.x, fraction_con[closet_axis.axis_calc_order[i-1]]);
                        placeholder_arrays_to_calc_structure[i][j][k].base_0.y = interpolate(placeholder_arrays_to_calc_structure[i-1][j][k].base_0.y, placeholder_arrays_to_calc_structure[i-1][j+1][k].base_0.y, fraction_con[closet_axis.axis_calc_order[i-1]]);
                        placeholder_arrays_to_calc_structure[i][j][k].base_1.x = interpolate(placeholder_arrays_to_calc_structure[i-1][j][k].base_1.x, placeholder_arrays_to_calc_structure[i-1][j+1][k].base_1.x, fraction_con[closet_axis.axis_calc_order[i-1]]);
                        placeholder_arrays_to_calc_structure[i][j][k].base_1.y = interpolate(placeholder_arrays_to_calc_structure[i-1][j][k].base_1.y, placeholder_arrays_to_calc_structure[i-1][j+1][k].base_1.y, fraction_con[closet_axis.axis_calc_order[i-1]]);
                }
            }
    }



    text_path_to_draw = placeholder_arrays_to_calc_path[placeholder_arrays_to_calc_path.length - 1][0];
    structure_path_to_draw = placeholder_arrays_to_calc_structure[placeholder_arrays_to_calc_structure.length - 1][0]


    return { text_path_to_draw, structure_path_to_draw }
    
}




    this.draw = function(variables){

        let total_width = sumArray(width_con);


         // might be able to take out of draw function if scale don't change in motion
        if(assets.alignment == 'center'){
            for(let i = 0; i < text.length; i++){
                text_alignment = assets.position.x - (total_width / 2);
            }
        }else if(assets.alignment == 'left'){
            for(let i = 0; i < text.length; i++){
                text_alignment = assets.position.x;
            }
        }else if(assets.alignment == 'right'){
            for(let i = 0; i < text.length; i++){
                text_alignment = assets.position.x - total_width;
            }
        }


        // might be able to take out of draw function if scale don't change in motion
        if(assets.sticky == 'bottom'){
            for(let i = 0; i < text.length; i++){
                pos_y_align[i] = - ((variablefont[0].typeface.parameters.ascender - variablefont[0].typeface.parameters.descender) * assets.scale);
            }
        }else{
            for(let i = 0; i < text.length; i++){
                pos_y_align[i] = 0;
            }
        }


        
        let text_path_to_draw = calc_test(variables).text_path_to_draw;
        let structure_path_to_draw = calc_test(variables).structure_path_to_draw;
            
        


        ctx.beginPath();
        for (let i = 0; i < text.length; i++) {

            for (let j = 0; j < text_path_to_draw[i].length; j++) {
                ctx.moveTo(
                    (text_path_to_draw[i][j][0].x * assets.scale) + updated_width_con[i] + text_alignment, 
                   ((-text_path_to_draw[i][j][0].y + variablefont[0].typeface.parameters.ascender) * assets.scale) + assets.position.y + pos_y_align[i]
                );

                for (let k = 0; k < text_path_to_draw[i][j].length - 1; k++) {
                    ctx.bezierCurveTo(
                        (text_path_to_draw[i][j][k].out_x * assets.scale) + updated_width_con[i] + text_alignment, 
                       ((-text_path_to_draw[i][j][k].out_y + variablefont[0].typeface.parameters.ascender) * assets.scale) + assets.position.y + pos_y_align[i], 
                        (text_path_to_draw[i][j][k + 1].in_x * assets.scale) + updated_width_con[i] + text_alignment, 
                       ((-text_path_to_draw[i][j][k + 1].in_y + variablefont[0].typeface.parameters.ascender) * assets.scale) + assets.position.y + pos_y_align[i], 
                        (text_path_to_draw[i][j][k + 1].x * assets.scale) + updated_width_con[i] + text_alignment, 
                       ((-text_path_to_draw[i][j][k + 1].y + variablefont[0].typeface.parameters.ascender) * assets.scale) + assets.position.y + pos_y_align[i]
                    );
                }

                ctx.bezierCurveTo(
                    (text_path_to_draw[i][j][text_path_to_draw[i][j].length - 1].out_x * assets.scale) + updated_width_con[i] + text_alignment, 
                   ((-text_path_to_draw[i][j][text_path_to_draw[i][j].length - 1].out_y + variablefont[0].typeface.parameters.ascender) * assets.scale) + assets.position.y + pos_y_align[i],
                    (text_path_to_draw[i][j][0].in_x * assets.scale) + updated_width_con[i] + text_alignment, 
                   ((-text_path_to_draw[i][j][0].in_y + variablefont[0].typeface.parameters.ascender) * assets.scale) + assets.position.y + pos_y_align[i],
                    (text_path_to_draw[i][j][0].x * assets.scale) + updated_width_con[i] + text_alignment, 
                   ((-text_path_to_draw[i][j][0].y + variablefont[0].typeface.parameters.ascender) * assets.scale) + assets.position.y + pos_y_align[i]
                );
            }


        }

        ctx.fillStyle = assets.color;
        ctx.fill();
        ctx.strokeStyle = assets.stroke_style;
        ctx.lineWidth = assets.stroke_width;
        ctx.stroke();
        ctx.closePath();

        

        for (let i = 0; i < text.length; i++) {

            ctx.beginPath();
                ctx.moveTo((structure_path_to_draw[i].point_0.x * assets.scale) + updated_width_con[i] + text_alignment, (structure_path_to_draw[i].point_0.y * assets.scale) + assets.position.y + pos_y_align[i]);
                ctx.lineTo((structure_path_to_draw[i].point_1.x * assets.scale) + updated_width_con[i] + text_alignment, (structure_path_to_draw[i].point_1.y * assets.scale) + assets.position.y + pos_y_align[i]);
                ctx.lineTo((structure_path_to_draw[i].point_2.x * assets.scale) + updated_width_con[i] + text_alignment, (structure_path_to_draw[i].point_2.y * assets.scale) + assets.position.y + pos_y_align[i]);
                ctx.lineTo((structure_path_to_draw[i].point_3.x * assets.scale) + updated_width_con[i] + text_alignment, (structure_path_to_draw[i].point_3.y * assets.scale) + assets.position.y + pos_y_align[i]);
                
                ctx.lineTo((structure_path_to_draw[i].point_0.x * assets.scale) + updated_width_con[i] + text_alignment, (structure_path_to_draw[i].point_0.y * assets.scale) + assets.position.y + pos_y_align[i]);

                ctx.strokeStyle = assets.structure_style;
                ctx.lineWidth = assets.structure_width;
                ctx.stroke();

                ctx.closePath();


                ctx.beginPath();
                ctx.moveTo((structure_path_to_draw[i].base_0.x * assets.scale) + updated_width_con[i] + text_alignment, (structure_path_to_draw[i].base_0.y * assets.scale) + assets.position.y + pos_y_align[i]);
                ctx.lineTo((structure_path_to_draw[i].base_1.x * assets.scale) + updated_width_con[i] + text_alignment, (structure_path_to_draw[i].base_1.y * assets.scale) + assets.position.y + pos_y_align[i]);

                ctx.strokeStyle = assets.structure_style;
                ctx.lineWidth = assets.structure_width;
                ctx.stroke();

            ctx.closePath();

        }


        for(let i = 0; i < text.length; i++){
            width_con[i] = (structure_path_to_draw[i].point_1.x - structure_path_to_draw[i].point_0.x) * assets.scale;
        }


        // Variable to store the cumulative sum
        let cumulativeSum = 0;


        // Loop through the original array starting from index 1
        for (let i = 0; i < width_con.length; i++) {
            cumulativeSum += width_con[i];
            updated_width_con[i + 1] = cumulativeSum;
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