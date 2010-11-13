module.exports = {
    isCalled: isCalled
  , callChecker: callChecker
  , checklist: checklist
  }

var assert = require ('assert')
  , util = require ('util')

function checklist (l){
	var list = l.concat()
	  , timer = null
	check.onDone = onDone
	check.timeout = timeout
	
	return check
	
	function check(item){
		//call with no args to assert that check list should be finished.
		//if this fails it will make the test fail like an error rather than not finish.
		if (arguments.length === 0){
			assert.equal(list.length,0,"expected check to be [] but was:" + list);
			
		} else {
			var index = list.indexOf(item)
			assert.ok(index != -1, "expected that list :" + util.inspect(list) + " included " + util.inspect(item) )
			list.splice(index,1)
			if (list.length == 0 && check.finish){
        process.nextTick(function(){check.finish();});
			}
		}
	}
	function onDone (done){
	  check.finish = function (){
	    timer && clearTimeout(timer)
	    done()
	    }
	  return check
	}
	function timeout (time){

	  timer = setTimeout(timeoutError,time)//call 
    
	  return check
	  
	  function timeoutError (){
	    check() // check that the checklist is completed. will throw an error if not!
	  }
	}
}



function isCalled(func,deadline,obj){
  deadline = deadline || 500
  var time = setTimeout(tooLate,deadline)

  return function (){
    clearTimeout(time)
    func.apply(obj,arguments)
  }

  function tooLate(){
    test.ok(false,"expected function " + func + " to have been called within " + deadline + " milliseconds")
  }
}


function callChecker (timeout,done){
  var atleastone = false
    , functions = []
  timer = setTimeout(function (){
    assert.ok(atleastone,"callChecker(" + timeout + ",done) as called. but return value, isCalled() was never invoked")
    assert.equal(functions.length,0,functions.length + " functions wrapped in isCalled(function) where not called")
  });

  return isCalled
  function isCalled (func,obj){
    functions.push(func)
    atleastone = true
    
    checker.times = function (n){
      //just delete the extra occurances, and then add what number is desired.
      //this is far from optiomal. but i'm hungover.
      while(functions.indexOf(func) != -1){
        functions.splice(functions.indexOf(func),1)  
      }
      for (i = 0; i < n; i ++){
        functions.push(func)
      }
      return checker
    }    
    return checker
    function checker (){
      var index = functions.indexOf(func)
        , returned

      assert.notEqual(index,-1,'unexpected call of :' + func)
      
      returned = func ? func.apply(obj,arguments) : null
      
      functions.splice(index,1)
      if(functions.length == 0 && done){
        process.nextTick(done)
      }
      return returned
    }
  }
}
