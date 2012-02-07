// poor man's unit test framework
// TODO: dress this up with Jasmine or QUnit or something
function testBehaviorTree(behavior_tree) {
    function assert_equal(left, right) {
	if (left !== right) {
	    throw new Error("assertion failure: "+
			    left+
			    ' does not equal '+
			    right)
	}
    }
    var Branch = behavior_tree.Branch
    var Leaf = behavior_tree.Leaf
    var Delay = behavior_tree.Delay
    var Prioritized = behavior_tree.Prioritized
    var Sequence = behavior_tree.Sequence
    var Rule = behavior_tree.Rule
    var success = behavior_tree.success
    var failure = behavior_tree.failure
    var sequential_and = behavior_tree.sequential_and
    var sequential_or = behavior_tree.sequential_or
    var reactive_and = behavior_tree.reactive_and
    var reactive_or = behavior_tree.reactive_or

    function test_success_is_success() {
	var tree = new Leaf(success)
	assert_equal(tree.start(), success)
    }
    function test_sequential_and_does_not_short_cut_on_success() {
	assert_equal(false, sequential_and.shortCutsOn(success))
    }
    function test_success_is_done() {
	assert_equal(true, success.done())
    }
    function test_success_is_sequential_and_id() {
	assert_equal(success, sequential_and.id())
    }
    function test_success_and_success_is_success() {
	var tree = new Branch(new Leaf(success),
			      sequential_and,
			      new Leaf(success))
	assert_equal(tree.start(), success)
    }
    function test_success_and_failure_is_failure() {
	var tree = new Branch(new Leaf(success),
			      sequential_and,
			      new Leaf(failure))
	assert_equal(tree.start(), failure)
    }
    function test_sequential_one_step_cases() {
	var cases = [
	    { l: success, op: sequential_and, r: success, is: success },
	    { l: success, op: sequential_and, r: failure, is: failure },
	    { l: failure, op: sequential_and, r: {}, is: failure },
	    { l: failure, op: sequential_or, r: failure, is: failure },
	    { l: failure, op: sequential_or, r: success, is: success },
	    { l: success, op: sequential_or, r: {}, is: success }
	]
	for (var i in cases) {
	    var tree = new Branch(new Leaf(cases[i].l),
				  cases[i].op,
				  new Leaf(cases[i].r))
	    assert_equal(tree.start(), cases[i].is)
	}
    }
    function test_two_step_cases() {
	var cases = [
	    { l: success, op: sequential_and, r: success, is: success },
	    { l: success, op: sequential_and, r: failure, is: failure },
	    { l: success, op: reactive_and, r: success, is: success },
	    { l: success, op: reactive_and, r: failure, is: failure },
	    { l: failure, op: sequential_or, r: failure, is: failure },
	    { l: failure, op: sequential_or, r: success, is: success },
	    { l: failure, op: reactive_or, r: failure, is: failure },
	    { l: failure, op: reactive_or, r: success, is: success }
	]
	for (i in cases) {
	    var tree = new Delay(new Branch(new Leaf(cases[i].l),
					    cases[i].op,
					    new Leaf(cases[i].r)))
	    assert_equal(tree.start().step(tree), cases[i].is)
	    var tree = new Branch(new Delay(new Leaf(cases[i].l)),
				  cases[i].op,
				  new Leaf(cases[i].r))
	    assert_equal(tree.start().step(tree), cases[i].is)
	    var tree = new Branch(new Leaf(cases[i].l),
				  cases[i].op,
				  new Delay(new Leaf(cases[i].r)))
	    assert_equal(tree.start().step(tree), cases[i].is)
	}
    }
    function test_changing_cases() {
	var ops = [ sequential_and, reactive_and, sequential_or, reactive_or ]
	for (i in ops) {
	    var op = ops[i];
	    var identity = op.id()
	    var killer = op.killer
	    var initially = new Branch(new Leaf(identity),
				       op,
				       new Delay(new Leaf(identity)))
	    var mind_state = initially.start()
	    var later = new Branch(new Leaf(killer),
				   op,
				   new Delay(new Leaf(identity)))
	    var result = mind_state.step(later)
	    if (op.reactive()) {
		assert_equal(result, killer);
	    } else {
		assert_equal(result, identity);
	    }
	}
    }

    // TODO: this is not really sufficient exercise of
    // Prioritized, Sequence, and Rule
    function test_tree_builders_insufficiently() {
	// first the agent ses a path to the left
	var clear_left = new Leaf(success)
	var clear_ahead = new Leaf(failure)
	var clear_right = new Leaf(failure)
	var advance = new Delay(new Leaf(success))
	var turn_left = new Delay(new Leaf(success))
	var turn_right = new Delay(new Leaf(success))
	var policy = Prioritized([
	    Rule(clear_ahead, advance),
	    Rule(clear_left, Sequence([turn_left, advance])),
	    Rule(clear_right, Sequence([turn_right, advance]))])
	var mind_state = policy.start()
	assert_equal(mind_state.toString(), 'lrrl')
	// if nothing changes, then the agent goes on to advance
	mind_state = mind_state.step(policy)
	assert_equal(mind_state.toString(), 'lrrr')
        // but if the agent now sees a path forward
	clear_ahead = new Leaf(success)
	policy = Prioritized([Rule(clear_ahead, advance),
                              Rule(clear_left, Sequence([turn_left, advance])),
                              Rule(clear_right, Sequence([turn_right, advance]))
			     ])
	// then the agent instead follows the clear_ahead => advance rule
	mind_state = mind_state.step(policy)
	assert_equal(mind_state.toString(), 'llr')
    }

    // actually run the tests
    test_success_is_success()
    test_sequential_and_does_not_short_cut_on_success()
    test_success_is_sequential_and_id()
    test_success_is_done()
    test_success_and_success_is_success()
    test_success_and_failure_is_failure()
    test_sequential_one_step_cases()
    test_two_step_cases()
    test_changing_cases()
    test_tree_builders_insufficiently()

}

