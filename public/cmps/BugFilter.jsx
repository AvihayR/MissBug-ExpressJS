const { useState, useEffect } = React

export function BugFilter({ filterBy, setFilterBy, isEndOfPagination }) {
    const [filterByToEdit, setFilterByToEdit] = useState(filterBy)

    useEffect(() => {
        setFilterBy(filterByToEdit)
    }, [filterByToEdit])

    function handleChange({ target }) {
        const field = target.name
        let value = target.value

        switch (target.type) {
            case 'number':
            case 'range':
                value = +value || ''
                break

            case 'checkbox':
                value = target.checked
                break

            default:
                break
        }
        setFilterByToEdit((prevFilterBy) => ({ ...prevFilterBy, [field]: value }))
    }

    function onSubmitFilter(ev) {
        ev.preventDefault()
        setFilterBy(filterByToEdit)
    }

    function onChangePageIdx(diff) {
        setFilterBy(prevFilter => ({ ...prevFilter, pageIdx: prevFilter.pageIdx + diff }))
    }

    const { txt, severity } = filterByToEdit
    return (
        <section className="bug-filter full main-layout">
            <h2>Filter Our Bugs</h2>
            <button disabled={filterBy.pageIdx === 0 ? true : false} onClick={() => { onChangePageIdx(-1) }}>-</button>
            <span>{filterBy.pageIdx + 1}</span>
            <button disabled={isEndOfPagination ? true : false} onClick={() => { onChangePageIdx(1) }}>+</button>

            <form onSubmit={onSubmitFilter}>
                <br />
                <label htmlFor="txt">Text:</label>
                <input
                    value={txt}
                    onChange={handleChange}
                    name="txt"
                    id="txt"
                    type="text"
                    placeholder="By Text"
                />

                <label htmlFor="severity">Min Severity:</label>
                <input
                    value={severity}
                    onChange={handleChange}
                    type="number"
                    name="severity"
                    id="severity"
                    placeholder="By Severity"
                />
                <button>Filter Bugs</button>
            </form>
        </section>
    )
}
