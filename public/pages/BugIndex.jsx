import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'
import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugSort } from '../cmps/BugSort.jsx'
import { utilService } from '../services/util.service.js'
import { userService } from '../services/user.service.js'
const { useState, useEffect, useRef } = React

export function BugIndex() {
    const [bugs, setBugs] = useState(null)
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())
    const [sortBy, setSortBy] = useState(bugService.getDefaultSort())
    const [isEndOfPagination, setEndOfPagination] = useState(false)

    useEffect(() => {
        loadBugs()
    }, [filterBy, sortBy])

    const debouncedSetFilter = useRef(utilService.debounce(setFilterBy, 500))

    function loadBugs() {
        bugService.query(filterBy, sortBy)
            .then(bugs => {
                setBugs(bugs)
                setEndOfPagination(false)
            })
            .catch(err => {
                setEndOfPagination(true)
            })
    }

    function onRemoveBug(bugId) {
        bugService
            .remove(bugId)
            .then((res) => {
                console.log(res)
                const bugsToUpdate = bugs.filter((bug) => bug._id !== bugId)
                setBugs(bugsToUpdate)
                showSuccessMsg(res)
            })
            .catch((err) => {
                console.log('Error from onRemoveBug ->', err)
                showErrorMsg('Cannot remove bug')
            })
    }

    function onAddBug() {
        const bug = {
            title: prompt('Bug title?'),
            severity: +prompt('Bug severity?'),
            owner: userService.getLoggedinUser()
        }

        bugService
            .save(bug)
            .then((savedBug) => {
                console.log('Added Bug', savedBug)
                setBugs([...bugs, savedBug])
                showSuccessMsg('Bug added')
            })
            .catch((err) => {
                console.log('Error from onAddBug ->', err)
                showErrorMsg('Cannot add bug')
            })
    }

    function onEditBug(bug) {
        console.log('click edit')

        const severity = +prompt('New severity?')
        const bugToSave = { ...bug, severity }
        bugService
            .save(bugToSave)
            .then((savedBug) => {
                console.log('Updated Bug:', savedBug)
                const bugsToUpdate = bugs.map((currBug) =>
                    currBug._id === savedBug._id ? savedBug : currBug
                )
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug updated')
            })
            .catch((err) => {
                console.log('Error from onEditBug ->', err)
                showErrorMsg('Cannot update bug')
            })
    }

    return (
        <main>
            <h3>Bugs App</h3>
            <main>
                <BugSort sortBy={sortBy} setSortBy={setSortBy} />
                <BugFilter setFilterBy={debouncedSetFilter.current} filterBy={filterBy} isEndOfPagination={isEndOfPagination} />
                <button onClick={onAddBug}>Add Bug ⛐</button>
                <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
            </main>
        </main>
    )
}
