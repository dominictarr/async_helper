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
    , functions = {}
    , _assert = assert
    , timer = setTimeout(function (){
      _assert.ok(atleastone,"callChecker(" + timeout + ",done) as called. but return value, isCalled() was never invoked")
      unfinished = checkFinished()
      _assert.equal(unfinished,0, errorReport ())
    });
  isCalled.asserter = function(ass){
    _assert = ass
    return isCalled
  }

  return isCalled
  function isCalled (func,obj){
    func = func || ("Anonymous_" + Math.round(Math.random()*10000000))
    atleastone = true

    functions[func] = 
      { self:obj
      , called: 0
      , times: 1
      }
    
    checker.times = function (n){
      functions[func].times = n
      return checker
    }
    checker.before = function (n){
      functions[func].before = n
      return checker
    }
    checker.after = function (n){
      functions[func].after = n
      return checker
    }

    return checker
    function checker (){
      var returned

      //_assert.notEqual(index,-1,'unexpected call of :' + func)
      if(functions[func].before){
        _assert.strictEqual(functions[functions[func].before].isCalled,false
          , "function :" + func + " expected to be called after "
          + "function :" + functions[func].before)
      } else if(functions[func].after) {
        _assert.strictEqual(functions[functions[func].after].isCalled,true
          , "function :" + func + " expected to be called after "
          + "function :" + functions[func].after)
      }
      
      functions[func].isCalled = true
      _assert.ok(functions[func].called < functions[func].times
           , "function :" + func 
           + " has already been called: " 
           + functions[func].times + " times")

      returned = 'function' == typeof func ? func.apply(obj,arguments) : null
      
      functions[func].called = functions[func].called + 1 

      if(checkFinished() == 0){
        clearTimeout(timer)
        if(done)
          process.nextTick(done)
      }
      return returned
    }
  }

  function checkFinished (){
    var unfinished = 0
    for(i in functions){
      if(functions[i].called !== functions[i].times)
        unfinished = unfinished + 1
    }  
    return unfinished
  }
  function errorReport (){
    var s = ''
    for(i in functions){
      if(functions[i].called !== functions[i].times){
        s = s + 'expected: ' + i 
          + " to be called " 
          + functions[i].times + " times, was called: "   
          + functions[i].called + " times.\n"
      }
    }  
    return s
  }

}
