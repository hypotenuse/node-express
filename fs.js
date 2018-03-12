

var path = require('path')
var fs = require('fs')

var fsTestContent = fs.readFileSync(path.join(__dirname, 'fs-test.txt'), { encoding: 'utf-8' })

function prepareFsTestContent(fsTestContent, replacement) {
	return fsTestContent.replace(/\{\{\s*(.+?)\s*\}\}/g, function(match, property) {
		return String(replacement[property])
	})
}

prepareFsTestContent(fsTestContent, { cpus: require('os').cpus().length })

/*
class TimebackComponent2 extends TimebackComponent {

	constructor(name = 'Igor') {}
	
	componentWillMount() {}

	componentDidMount() {}
	componentWillUnmount() {}

	shouldComponentUpdate(nextProps, nextState) { return true }

	componentWillUpdate(nextProps, nextState) {}
	componentDidUpdate(prevProps, prevState) {}

	componentWillReceiveProps(nextProps) {}

	render() {
		return <div className={'class1'} style={{ fontFamily: '14px sans-serif' }}>TimebackComponent2</div>
	}

}
*/