"use strict";

function generate(){
	let project_name = document.getElementById('project').value
	document.getElementById('output').value = ''
    let request = new XMLHttpRequest();
    request.open('GET', "https://raw.githubusercontent.com/entrepreneur-interet-general/eig-link/master/suivi.org", true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {

            let project_text = isolateProject(request.responseText, project_name)
            document.getElementById('output').value = getCode(document.getElementById('input').value, project_name, project_text)

        }
    }
}

function isolateProject(full_text, project_name){
	let pattern = "(\\* " + project_name + ")[\\s\\S]+?(?=\\n\\n\\*\\* Suite)"
	let re = new RegExp(pattern)
	return full_text.match(re)[0]
}

function getCode(input, project_name, project_text){
	let res = project_text

	res += getNewsCode(getNews(input), project_name, get_dims(project_text))
	res += "\n\n** Suite\n\n"
	res += getSuite(input)

	return res
}

function getNewsCode(news, project_name,dims){
	let res = ""
	res += "\n"
	res += getSepLine(dims)

	let date = new Date()


	res += "\n"
	for (let i = 0; i < news.length; i++) {
		res += getNewsLine(news[i].livrable, news[i].action, news[i].cat, project_name, date, dims)
		res += "\n"
	}

	return res
}

function getNews(input){
	let res = []
	let lines = input.split('\n')
	let scanning = false
	let end = false
	let string = ""

	for (let i = 0; i < lines.length; i++) {
		string = lines[i]
	    if(scanning){
	    	if (!(/\[.*\]/.test(string))){
	    		scanning = false
	    		end = true
	    	}
	    }
	    else{
	    	if (!end && /\[.*\]/.test(string)){
	    		scanning = true
	    	}
	    }

	   	if(scanning){
	   		console.log(string)
			res.push({
    			cat:string.match(/(?<=\[).*(?=\])/)[0],
    			livrable:(/\{.*\}/.test(string) ? string.match(/(?<=\{).*(?=\})/)[0] : ''),
    			action:string.replace(/(\{.*\}|\[.*\])/g, "").replace(/( )*(-|\*)( )*/,"")
			})
    	}
	}
	return res
}

function getSepLine(dims){
	return "   |" + repeat_s('-', dims.len_proj) + '+' + repeat_s('-', dims.len_livrable) + '+' + repeat_s('-', dims.len_action) + '+' + repeat_s('-', dims.len_date) + '+' + repeat_s('-', dims.len_cat) + '|'
}

function getNewsLine(livrable, action, cat, project_name, date, dims){

	let weekday = new Array(7);
	weekday[0] =  "dim";
	weekday[1] = "lun";
	weekday[2] = "mar";
	weekday[3] = "mer";
	weekday[4] = "jeu";
	weekday[5] = "ven";
	weekday[6] = "sam";

	let date_dd = date.getDate()
	let date_mm = date.getMonth() + 1
	let date_dow = weekday[date.getDay()]
	let date_yyyy = date.getFullYear()

	if(date_dd<10) {
	    date_dd = '0'+date_dd
	} 

	if(date_mm<10) {
	    date_mm = '0' + date_mm
	} 

	let date_s = "<" + date_yyyy + "-" + date_mm + "-" + date_dd + " " + date_dow + ".>"

	let res = ""
	res += "   |" + pad_cell(project_name, dims.len_proj)
	res += "|" + pad_cell(livrable, dims.len_livrable)
	res += "|" + pad_cell(action, dims.len_action)
	res += "|" + pad_cell(date_s, dims.len_date)
	res += "|" + pad_cell(cat, dims.len_cat) + "|"

	return res
}

function getSuite(input){
	let res = ""
	let lines = input.split('\n')
	let scanning = false
	let end = false
	let string = ""

	for (let i = 0; i < lines.length; i++) {
		string = lines[i]
	    if(scanning){
	    	if (string == ""){
	    		scanning = false
	    		end = true
	    	}
	    	else{
	    		res += "* " + string.replace(/( )*(-|\*)( )*/,"") + "\n"
	    	}
	    }
	    else{
	    	if (!end && /prochaine/.test(string)){
	    		scanning = true
	    	}
	    }
	}

	console.log(res)
	return res
}

function repeat_s(char, times){
	let res = ""

	if(times > 0){
		for(let i=0; i < times; i++){
			res += char
		}
	}

	return res
}

function pad_cell(string, length){
	 if(string.length <= length-2){
	 	return ' ' + string + repeat_s(' ', length-2-string.length) + ' '
	 }
	 else{
	 	return " " + string.substring(0,length-5) + "... "
	 }
}

function get_dims(full_text){
	let pattern = ".*---.*"
	let re = new RegExp(pattern)
	let line = full_text.match(re)[0]
	let cells = line.split(/[|\+ ]+/)
	return {
		len_proj:cells[1].length,
		len_livrable:cells[2].length,
		len_action:cells[3].length,
		len_date:cells[4].length,
		len_cat:cells[5].length,
	}
}