//async_helper.asynct.js

var helper = require('async_helper')
  , inspect = require('util').inspect
  
exports['test checklist empty'] = function (test){
  var check = helper.checklist([])
  check()
  test.finish()
}

exports['test checklist simple'] = function (test){
  var check = helper.checklist(['a','b','c'])
  check('a')
  check('b')
  check('c')
  check()
  test.finish()
}

exports['test checklist throws error if check() and list is unfinished'] = function (test){
  var check = helper.checklist(['a','b','c'])
  check('a')
  check('c')
  test.throws(function(){ check() }) //calling check with no args asserts that the list is empty.
  test.finish()
}

exports['test checklist call finished'] = function (test){
  var check = helper.checklist(['a','b','c'])
    , timer
  check.finish = function (){
    clearTimeout(timer)
    test.finish()
  }
  timer = setTimeout(function (){
    test.ok(false,"this test timed out")
  },100)
  check('a')
  check('c')
  process.nextTick(function(){check('b')})
}

exports['test checklist onDone finished'] = function (test){
  var check = helper.checklist(['a','b','c']).onDone(done)
    , timer
  function done (){
    clearTimeout(timer)    
    test.finish()
  }
  timer = setTimeout(function (){
    test.ok(false,"this test timed out")
  },100)
  check('a')
  check('c')
  process.nextTick(function(){check('b')})
}

exports['test checklist timeout throws'] = function (test){
  var check = helper.checklist(['a','b','c']).timeout(50)
  test.uncaughtExceptionHandler = function(error){
    test.equal(error.name,'AssertionError')
    test.finish()
  }
}
exports['test checklist done cancels timeout '] = function (test){
  var check = helper.checklist(['a','b','c']).timeout(50).onDone(test.finish)
  check('a')
  check('c')
  process.nextTick(function(){check('b')})
}

//give checklist a custom assert

exports['test isCalled'] = function (test){
  var isCalled = helper.callChecker(50)
  test.uncaughtExceptionHandler = function(error){ //if no functions are set isCalled and it times out, thats an error.
    test.equal(error.name,'AssertionError')
    test.finish()
  }
}

exports['test isCalled'] = function (test){
  var isCalled = helper.callChecker(50,test.finish)
    , x = isCalled()
    
    x()
}

exports['test isCalled twice'] = function (test){
  var isCalled = helper.callChecker(50,test.finish)
    , x = isCalled()
    , y = isCalled(function (){return 125324})
    
    x()
    process.nextTick(function (){
      test.equal(y(),125324)
    })
}

exports['call is registered even if the function throws'] = function (test){
  var isCalled = helper.callChecker(50,called)
    , x = isCalled()
    , error = new Error("an error thrown within a checked callback")
    , y = isCalled(function (){throw error })
    
    x()
    process.nextTick(function (){
      y()
    })
    
    test.uncaughtExceptionHandler = function (e){
      test.equal(e,error)
    }
    
    function called(){
      test.finish()
    }
    
}


//expand this to handle multiple calls: isCalled(func).times(10) or .not() before(other_func) or after(other_func)
/*
  how might i implement that?
  
  give each wrapper a id number, store the functions and counts, and befores and afters in hashes

*/

exports['test isCalled.times(2) errors if called less than twice. '] = function (test){
  var isCalled = helper.callChecker(50)
    , x = isCalled().times(2)
    
    x()

  test.uncaughtExceptionHandler = function(error){ //if no functions are set isCalled and it times out, thats an error.
    test.equal(error.name,'AssertionError')
    test.finish()
  }
}

exports['test isCalled.times(2) errors if called more than twice. '] = function (test){
  var isCalled = helper.callChecker(50).asserter(test)
    , x = isCalled().times(2)
    
    x()
    x()
    test.throws(x)

    test.finish()
}

exports['test isCalled.times(0) errors if called at all. '] = function (test){
  var isCalled = helper.callChecker(50)
    , x = isCalled().times(0)

    test.throws(x)

    test.finish()
}

/*
  before and after will require some refactoring.
  
  i'll need to store more information about each function,
  and since before and after need to know about other tests, 
  i'll have to beable to reference that too!

*/

//will this work with identical anonymous functions?

exports['test isCalled(x).after(y) checks that x is called before y'] = function (test){
  var isCalled = helper.callChecker(50)
    , x = isCalled(X)
    , y = isCalled(Y).after(X)

    function X (){}
    function Y (){}
    
    x()
    y()//because x has not yet been called.

    test.finish()
}

exports['test isCalled(x).after(y) errors if y is called before x'] = function (test){
  var isCalled = helper.callChecker(50)
    , x = isCalled(X)
    , y = isCalled(Y).after(X)

    function X (){}
    function Y (){}
    
    test.throws(y)//because x has not yet been called.
    x()

    test.finish()
}

