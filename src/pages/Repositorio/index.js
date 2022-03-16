import React, {useEffect, useState} from 'react';
import {Container, Owner, Loading, BackButton, IssuesList, PageActions, FilterList} from './styled';
import { FaArrowLeft } from 'react-icons/fa';
import api from '../../services/api';


export default function Repositorio({match}){

    const [repositorio, setRepositorio] = useState({});
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState([{state: 'all', label:'Todas', active: true}, {state: 'open', label:'abertas', active: false}, {state: 'closed', label:'fechadas', active: false}])
    const [filterIndex, setFilterIndex] = useState(0);

    useEffect(()=>{
        async function load(){
            const nomeRepo = decodeURIComponent(match.params.repositorio);

            const [repositorioData, issuesData] = await Promise.all([
                api.get(`/repos/${nomeRepo}`),
                api.get(`/repos/${nomeRepo}/issues`,{
                    params:{
                        state: filter.find(f => f.active).state,
                        per_page:5
                    }
                })
            ])

            setRepositorio(repositorioData.data);
            setIssues(issuesData.data);
            setLoading(false);
        }   

        load();
    }, [match.params.repositorio])


    useEffect(() =>{
        async function loadIssue(){
            const nomeRepo = decodeURIComponent(match.params.repositorio);

            const response = await api.get(`/repos/${nomeRepo}/issues`,{
                params:{
                    state:filter[filterIndex].state,
                    page,
                    per_page: 5,
                },
            });

            setIssues(response.data);

        }

        loadIssue();

    }, [match.params.repositorio, page, filterIndex, filter])
    
    
    
    
    function handlePage(action){
        setPage(action === 'voltar'? page - 1 : page + 1); 
    }



    function handleFilter(index){
        setFilterIndex(index);
    }



    if(loading){
        return(
        <Loading>
            <h1>Carregando...</h1>
        </Loading>
        )
        
    }

    return(
        <Container>
            <BackButton to="/">
                <FaArrowLeft color="black" size={30}/>
            </BackButton>
            <Owner>
                <img src={repositorio.owner.avatar_url} alt={repositorio.owner.login}/>
                <h1>{repositorio.name}</h1>
                <p>{repositorio.description}</p>
            </Owner>

            <FilterList active={filterIndex}>

                {filter.map((filter, index) =>(
                    <button type='button' key={filter.label} onClick={() => handleFilter(index)}>{filter.label}</button>
                ))}

            </FilterList>


            <IssuesList>
                {issues.map(issue => (
                    <li key={String(issue.id)}>
                        <img src={issue.user.avatar_url} alt={issue.user.login}/>

                        <div>
                            <strong>
                                <a target="_blank" href={issue.html_url}>{issue.title}</a>
                                
                                {issue.labels.map(label => (
                                    <span key={String(label.id)}>{label.name}</span>
                                ))}
                            </strong>
                            <p>{issue.user.login}</p>
                        </div>


                    </li>
                ))}
            </IssuesList>
            
            <PageActions>
                <button type='button' onClick={()=> handlePage('voltar')} disabled={page < 2 }>Voltar</button>
                <button type='button' onClick={()=>  handlePage('proxima')}>Proximo</button>
            </PageActions>

            
        </Container>
    )
}