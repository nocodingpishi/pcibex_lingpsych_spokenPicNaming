/*
General Info "PC"Ibex is an abstraction layer/wrapper around Ibex
It interfaces with the underlying Ibex system. So to modify or access trial data
Look in the global scope for ibex_* variables
For repo https://github.com/addrummond/ibex/tree/master
for PC repo https://github.com/PennController/penncontroller/tree/master

*/

// PennController.AddHost("https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100..900&display=swap")

// initiates PennController: It loads PennController functions into global scope, it's like `import * from <module>`
// In reality it creates a window.proxy -> which is reset so we don't need to call window.PennController 
PennController.ResetPrefix(null)
DebugOff(); // Tells your experiment to not run in Debug mode

// To debug script go to Sources/...rails/<3rd entry>/main.js (it is uploaded as blob)

const showProgressBar = true; // show progress bar
const progressBarText = "Fortschritt"; // progress bar label
const random_list = Math.random() < 0.5 ? GetTable("exp_list_1.csv") : GetTable("exp_list_2.csv" )
const numberOfBreaks = 2; // not allowed 3 because 180 is not divisible by (3+1)
const number_of_trials = 180
const subdivisions_of_trials = number_of_trials/(numberOfBreaks+1)
/*
Instead of fetching audio and images from a distant URL 
for every single one of your PennController trials using one, 
you can choose to store them in ZIP archives that you upload on your server
*/

PreloadZip("https://www.ling.uni-potsdam.de/~lampe/SemMerk/zip_materials/Images_small.zip");


// Determines the order in which your trials will be run. Use your trials’ labels to manipulate the running order.

Sequence(
    "WelcomeConsent", 
    "initiate_recorder",
    "audio_check", 
    "demographics",
    "prac_intro",
    "prac_block", 
    "exp_intro",
    new SepWithN(seq("break", "sendAsync"), "experiment_naming", subdivisions_of_trials),
    //"*sync_uploads*", // this is incompatible with the previous sendAsync, if we change it without 'noblock' it works 
	"send",
	"final_message"
) 

const test = newText("hey", "hey!").print
console.log({test})

// --- TRIALS ---- //

/*

These are definitions/"trials" used to define the shape and name of sections of the experiment
which can then be referred to and executed by sequence and are tracked in results.csv

PennController = outdated version of newTrial
newTrial = for self built trial without external content - which is a wrapper to return PennController itself
Template = for self built trial with csv content
*/

// Welcome
newTrial("WelcomeConsent",
  newHtml("welcome", "welcome.html")
    .cssContainer({"width":"750px"})
    .checkboxWarning("Sie müssen zustimmen, um fortfahren zu können.")
  .center()
  .print(),
  newButton("continue", "Weiter")
    .css("font-size", "medium")
    .center()
    .print() // display the element on the screen
    .wait(getHtml("welcome").test.complete()
                  .failure(getHtml("welcome").warn())
)
).setOption("hideProgressBar",true);



//start the recorder and send result files to the server

Template(GetTable("intro_recorder.csv"),
    ir =>
    //InitiateRecorder(" https://www.ling.uni-potsdam.de/cslmlab/reliability/Session1_ListANonspeeded/uploadrecordings.php",ir.line1)
    InitiateRecorder(" https://www.ling.uni-potsdam.de/semmerk/picnaming/uploadrecordings.php",ir.line1)
        .label("initiate_recorder")
);

UploadRecordings("sendAsync", "noblock");

// audio check

Template(GetTable("audio_check.csv"),
    ac =>
    newTrial("audio_check",
        defaultText
        .center()
            .print()
        ,
        newText("line1", ac.line1)
	     .center()
	     .css("background", "white")
        ,
        newMediaRecorder("ac_recorder", "audio")
            .center()
            .print()
	    .css( {"padding": "20px", "background-color": "rgb(252, 250, 255)", "border-radius": "20px"} )
        ,
        newButton("ac_test_button", "Weiter")
            .center()
            .css("border", "solid 5px white")
            .print()
            .wait(getMediaRecorder("ac_recorder").test.recorded())
    )
);


const demographics_field_style = {
    "justify-content": "space-between",
    width: "100%",
    'font-family': "helvetica",
    'font-size': "22px",
    'margin-right': "0.5em"
}

// Demographics
newTrial("demographics",
    /*defaultText
        .cssContainer(demographics_field_style)
        .print(),
    defaultDropDown
        .cssContainer(demographics_field_style)
        .print(),
    defaultScale
        .cssContainer(demographics_field_style)
        .print()
      ,*/
    newText("DemographicsText", "<p>Bevor es losgeht, brauchen wir einige Angaben zu Ihrer Person. Diese werden anonymisiert gespeichert und eine spätere Zuordnung zu Ihnen wird nicht möglich sein.<p>")
            .italic()
            .cssContainer(demographics_field_style)
            .print()
    ,
    newTextInput("Prolific_ID_manual", "")
        .log()
        .size(300, 35 )
        .cssContainer(demographics_field_style)
        .before( newText("Prolific_ID_manual", "Wie lautet Ihre Prolific ID?"))
        .print()
        //.callback( getText("errorprolific").remove() )
    ,
    newTextInput("age_manual", "")
        .log()
        .size(300, 35 )
        .cssContainer(demographics_field_style)
        //.css("vertical-align","-50%")
        .before( newText("age_manual", "Wie alt Sie?"))
        .print()
        //.callback(getText("errorage2").remove())
    ,
    newDropDown("sex", "")
        .add("Weiblich","Männlich", "Divers", "Keine Angabe")
        .cssContainer(demographics_field_style)
        .log()
        .before( newText("sex", "Was ist Ihr biologisches Geschlecht? ") )
        .print()
        //.callback( getText("errorsex").remove() )
    ,
    newScale("L1", "Deutsch", "andere Sprache")
        .radio()
        .cssContainer(demographics_field_style)
        .labelsPosition("right")
        .vertical()
        .log()
        .before( newText("L1", "Was ist Ihre Muttersprache? ") )
        .print()
        //.callback( getText("errorL1").remove() )
    ,
    newScale("bilingual", "ja", "nein")
        .radio()
        .cssContainer(demographics_field_style)
        .labelsPosition("right")
        .vertical()
        .log()
        .before( newText("bilingual", "Sind Sie mehrsprachig aufgewachsen? ") )
        .print()
        //.callback( getText("errorbilingual").remove() )
    ,
    newScale("impairment", "ja", "nein")
        .radio()
        .cssContainer(demographics_field_style)
        .labelsPosition("right")
        .vertical()
        .log()
        .before( newText("impairment", "Wurde bei Ihnen eine Lese-Rechtsschreibschwäche <br> oder Sprachstörung diagnostiziert? ") )
        .print()
        //.callback( getText("errorimpairment").remove() )
    ,
    newDropDown("education", "")
        .add("Hauptschulabschluss", "Realschulabschluss", "Abitur", "Bachelor", "Master", 
        "Magister", "Diplom", "Promotion", "sonstige")
        .cssContainer(demographics_field_style)
        .log()
        .before( newText("Was ist Ihr höchster Bildungsabschluss? ") )
        .print()
        //.callback( getText("erroreducation").remove() )
    ,
   newDropDown("born", "")
        .add("Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", 
        "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen", "Nordrhein-Westfalen",
        "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen", "Rheinland-Pfalz", 
        "nicht in Deutschland geboren")
        .cssContainer(demographics_field_style)
        .log()
        .before( newText("In welchem Bundesland sind Sie aufgewachsen? ") )
        .print()
        //.callback( getText("errorborn").remove() )
    ,
    /*newCanvas("subjectinfo", 750, 900) // 500px height: we will print the button at the bottom
      .color("white") // Use a white background
      .add(0, 0, getText("DemographicsText", 200, 200))
      .add(0, "middle at 20%", getTextInput("Prolific_ID_manual", 200, 200)) 
      .add(0, "middle at 28%", getTextInput("age_manual", 200, 200))
      .add(0, "middle at 36%", getDropDown("sex", 200, 200)) 
      .add(0, "middle at 42%", getScale("L1", 200, 200))
      .add(0, "middle at 50%", getScale("bilingual", 200, 200))
      .add(0, "middle at 58%", getScale("impairment", 200, 200))
      .add(0, "middle at 64%", getDropDown("education", 200, 200))
      .add(0, "middle at 70%", getDropDown("born", 200, 200))
      .print("center at 50vw", "top at 7.5em")
      ,*/
    defaultText.color("red").print()
      ,
    newButton("qu_test_button", "Weiter im Vollbildmodus")
        .css("font-size", "medium")
        .print()
        .wait(
            newFunction('dummy', ()=>true).test.is(true)
            //Prolific_ID
            .and( getTextInput("Prolific_ID_manual").test.text(/[A-Za-z0-9]+/g)
                   .failure(appendErrorToInput("Prolific_ID_manual", "Bitte Prolific ID angeben."))
            // age
            ).and( getTextInput("age_manual").test.text(/^[^-0][0-9]+/g)
                    .failure(appendErrorToInput("age_manual", "Bitte geben sie ihr Alter als nicht negative Zahl ein"))
            // sex
            ).and( getDropDown("sex").test.selected()
                    .failure(appendErrorToInput("sex", "Bitte biologisches Geschlecht angeben.")) 
            // mother tongue
            ).and( getScale("L1").test.selected()
                    .failure(appendErrorToInput("L1", "Bitte angeben, ob Deutsch Ihre Muttersprache ist"))
            // bilingual
            ).and( getScale("bilingual").test.selected()
                    .failure(appendErrorToInput("bilingual", "Bitte angeben, ob Sie mehrsprachig aufgewachsen sind."))
            // impairment
            ).and( getScale("impairment").test.selected()
                    .failure(appendErrorToInput("impairment", "Bitte angeben, ob Sie eine Lese-Rechtsschreibschwäche o.Ä. haben."))
            // education
          ).and( getDropDown("education").test.selected()
            .failure(appendErrorToInput("education", "Bitte Bildungsabschluss angeben."))            
          // born
          ).and( getDropDown("born").test.selected()
            .failure(appendErrorToInput("born", "Bitte angeben, wo Sie geboren wurden."))
        ))
        ,
        fullscreen()
        //.log( "ProlificID" , getVar("Prolific_ID_manual"))
)



// To insert error message in document flow we inject a little hack into the PCIBex failure callback 
function appendErrorToInput(name, message){
    const name_s = name.replace(/[\s_]+/g,'')
    const id = `.${name_s}-error`;
    return ({
        _runPromises: () => {
            const selector = $(`.PennController-${name_s}-container`)[0]
            const selectorInput = $(`.PennController-${name_s}`);
            if($(`.${id}`).length < 1){
                const newMessage = $(`<span class="input_error custom ${id}">${message}</span>`);
                newMessage.appendTo(selector)
                if(selectorInput.length > 0){
                    selectorInput.click(() => {
                        newMessage.remove()
                    })
                }
            }
        }
    })
}


// Practice Intro
newTrial("prac_intro",
  newHtml("prac_intro", "prac_intro.html")
  .center()
  .print(),
  newButton("continue", "Weiter")
    .css("font-size", "medium")
    .center()
    .print()
    .wait()
).setOption("hideProgressBar",true);


//Practice Trials
Template (GetTable ( "prac_block.csv" ),
	    prac_block  =>
	    newTrial ( "prac_block" ,
		      defaultText
		      .print()
		      ,
	    newImage ( "fixation_cross" ,  "fixation.jpg" )
	        .center()
	        //. size ( 1280 ,  720 )
	        . print ( )
	        . log ( )
	    ,
	    newTimer ( "prac_fixation" ,  500 )
	        . start ( )
	        . wait ( )
	    ,
	    getImage ( "fixation_cross" )
	        . center()
	        . remove ( )
	    ,
	    newImage ( "prac_picture" ,  prac_block.Picture )
	        //. size ( 877 ,  620 )
	        .center()
	        . print ( )
	    ,
	    newTimer ( "prac_trial" ,  2000 )
	        . start ( )
	        . wait ( )
	        . log ( )
	    ,
	    getImage ( "prac_picture" )
	        .center()
	        . remove ( )
	    ,
	     newTimer ( "blank_timer" ,  1000 )
	        . start ( )
	        . wait ( )
	        . log ( )
	    )
    .log( "Target" , prac_block.Target )
    .log( "Picture" , prac_block.Picture)
);

//Intro Experimental Trials

Template(GetTable("experiment_intro.csv"),
    experiment_intro =>
    newTrial("exp_intro",
        defaultText
            .print()
        ,
        newText("line1", experiment_intro.line1)
            .center()
            .css("border", "solid 2px white")
     ,
      newKey(" ")
         .wait()
    )
);


const MainTrial = (listing) => {
    const recorder_id = l => `${GetURLParameter("id")}_${l.List}`
    return Template(listing ,
    	    list_entry  =>
    	    newTrial ( "experiment_naming" ,
    		      defaultText
    		      .print()
    		      ,
    	    newImage ( "fixation_cross" ,  "fixation.jpg" )
    	        .center()
    	        //. size ( 1280 ,  720 )
    	        . print ( )
    	        . log ( )
    	    ,
    	    newTimer ( "experiment_naming_fixation" ,  500 )
    	        . start ( )
    	        . wait ( )
    	    ,
    	    getImage ( "fixation_cross" )
    	        . center()
    	        . remove ( )
    	    ,
    	    newMediaRecorder(recorder_id(list_entry), "audio")
                .hidden()
                .record()
                .log()
             ,
    	    newImage ( "experiment_naming_Picture" ,  list_entry.Picture)
    	        //. size ( 877 ,  620 )
    	        .center()
    	        . print ( )
    	    ,
    	    newTimer ( "experiment_naming_timer" ,  2000 )
    	        . start ( )
    	        . wait ( )
    	        . log ( )
    	    ,
    	    getImage ( "experiment_naming_Picture" )
    	        .center()
    	        . remove ( )
    	   ,
    	    newTimer ( "blank_timer" , 1000 )
    	        . start ( )
    	        . wait ( )
    	        . log ( )
    	   ,
    	getMediaRecorder(recorder_id(list_entry))
            .stop()
            .remove()
        	.log()    
        )
        .log( "List" , list_entry.List)
        .log( "Stimulus" , list_entry.Stimulus )
        .log( "Category" , list_entry.Category )
        .log( "Picture" , list_entry.Picture)
    );
}

MainTrial(random_list)


//Break 
PennController("break",
  newHtml("break", "break.html")
  .center()
  .print(),
  newButton("continue", "Weiter")
    .css("font-size", "medium")
    .center()
    .print()
    .wait()
);

UploadRecordings("*sync_uploads*")

// Results.csv !!! Very important
SendResults("send")


Template(GetTable("final_message.csv"),
    fin =>
        newTrial("final_message",
            exitFullscreen()
            ,
            newText(fin.line1)
                .print()
            ,
            newButton("void")
                .wait()
        )
);

/*

Given two trials, containing a list of entries
insert the contents of `sep` inbetween every `n` entry of `listing`

@Class definition of a separator which 
Intersperses a collection of steps inbetween a listing of trials
intersperse ',' "abcde" -> "a,b,c,d,e" only that instead of a , you can also give it a list of other things that need to happen between the main experiments

*/

function SepWithN(sep, listing, n) {
    
    this.args = [sep, listing]; // Grouping parameters. Supporting multiple inbetween

    this.run = function(args) {
        
        assert(parseInt(n) > 0, "N must be a positive number");
        
        let sep = args[0];
        let listing = args[1];

        // If the listing has only one entry return it without interspersing
        // Shouldn't this be appended to sep even as a single entry?
        if (listing.length <= 1) 
            return listing;
            
        else {
            let finalSequence = [];
            // Using javascript weak dynamic typing to coarse int to a bool as a condition for the loop
            while (listing.length){
                // Define how many listing entries are grouped before interspersing the separation entries.
                for (let i = 0; i < n && listing.length>0; i++)
                    finalSequence.push(listing.shift());
                for (let j = 0; j < sep.length; j++)
                    finalSequence.push(sep[j]);
            }
            return finalSequence;
        }
    };
}


// Builder function to delegate parameters to new Object and returning it, so it can be passed as argument to Sequence function
function sepWithN(sep, main, n) { 
    return new SepWithN(sep, main, n); 
}


/*
Wait for PCIBex to place generated messages for user consent and feedback.
Enter frame based refresh loop to catch elements in English to translate to german
*/


const tryTranslate = (elementsToTranslate, fromLan, toLan) => {
    const pattern = new RegExp(`^${fromLan}`);
    if (elementsToTranslate.length > 0 && elementsToTranslate[0].innerHTML.match(pattern))
        elementsToTranslate.html(toLan);
}

let objectsToModify = {};

const update = () => {
    
    tryTranslate($(".PennController-PennController a.Message-continue-link"), 
    "By clicking this link I understand that I grant this experiment's script access to my recording device",
    "Durch Klicken auf diesen Link erkläre ich mich damit einverstanden, dass ich dem Experiment Zugriff auf mein Aufnahmegerät gewähre.")
    
    tryTranslate($(".PennController-PennController > div"), 
    "Please wait while the resources are preloading",
    "Bitte warten Sie kurz, während die Materialien geladen werden.")
    
    tryTranslate($(".PennController-PennController > p"), 
    "Please wait while the archive of your recordings is being uploaded to the server",
    "Bitte warten Sie kurz, während Ihre Aufnahmen auf den Server geladen werden.")

    tryTranslate($(".PennController-MediaRecorder-ui button"), 
    "Record",
    "Aufnehmen")
    
    // Hide the "after" element to fix alignment in Demographics
    if($(".PennController-DemographicsText-container").length > 0){
        $(".PennController-after").hide();
    }

    if(!objectsToModify.recording){
        const n = $('div:contains("Not recording")');
        if(n.length > 0){
            n.addClass("recording-label")
            objectsToModify.recording = n;
        }
    } else {
        tryTranslate(objectsToModify.recording,
        "Not recording",
        "Keine Aufzeichnung"
        );
        tryTranslate(objectsToModify.recording,
        "Recording.*",
        "Aufzeichnung läuft!")
    }
    
    if(!objectsToModify.audioPlaybackTest){
        const n = $(".PennController-MediaRecorder-ui audio");
        if(n.length > 0){
            objectsToModify.audioPlaybackTest = n
        }
    } else {
        if(objectsToModify.audioPlaybackTest.attr("src")){
            objectsToModify.audioPlaybackTest.addClass("ready");
        }
    }
    
    window.requestAnimationFrame(update);

}

window.requestAnimationFrame(update);

