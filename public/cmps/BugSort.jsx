export function BugSort({ sortBy, setSortBy }) {

    function handleChange({ target }) {

        const field = target.name
        let value = target.value
        console.log(field, value)

        switch (target.type) {
            case 'number':
            case 'range':
                value = +value || ''
                break;

            case 'checkbox':
            case 'radio':
                value = target.checked
                break

            default:
                break;
        }
        setSortBy({ [field]: value })
    }

    return (

        <select name="sortBy" onChange={handleChange}>
            <option name="sortBy" value="title">Sort by</option>
            <option name="sortBy" value="title">Title</option>
            <option name="sortBy" value="severity">Severity</option>
        </select>

    )
}