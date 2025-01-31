# pdfprocessor/utils.py
import os
from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

def process_pdf(pdf_path, vector_db_path):
    # Load document with improved error handling
    try:
        loader = PyMuPDFLoader(pdf_path)
        documents = loader.load()
    except Exception as e:
        raise RuntimeError(f"PDF loading failed: {str(e)}")

    # More sophisticated text splitting
    text_splitter = CharacterTextSplitter(
        chunk_size=1500,
        chunk_overlap=300,
        separator="\n",
        length_function=len
    )
    texts = text_splitter.split_documents(documents)

    # Create embeddings with better model
    embeddings = HuggingFaceEmbeddings(model_name="all-mpnet-base-v2")
    
    # Create vector DB with metadata
    vectordb = Chroma.from_documents(
        documents=texts,
        embedding=embeddings,
        persist_directory=vector_db_path,
        collection_metadata={"hnsw:space": "cosine"}  # Better similarity metric
    )
    vectordb.persist()
    
    return vectordb

def create_qa_chain(vector_db_path):
    # Custom prompt template for better context handling
    prompt_template = """Use the following context to answer the question. 
    Always prioritize information from these sources. If you don't know, say so.
    Use exactly relevant points from the context in your answer.

    Context: {context}
    Question: {question}

    Structured Answer:"""
    
    PROMPT = PromptTemplate(
        template=prompt_template,
        input_variables=["context", "question"]
    )

    # Initialize Groq LLM with better parameters
    llm = ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model_name="llama3-70b-8192",
        temperature=0.1,
    )

    # Load vector DB with relevance tuning
    embeddings = HuggingFaceEmbeddings(model_name="all-mpnet-base-v2")
    vectordb = Chroma(
        persist_directory=vector_db_path,
        embedding_function=embeddings
    )

    # Enhanced retriever configuration
    retriever = vectordb.as_retriever(
        search_type="mmr",  # Maximal Marginal Relevance
        search_kwargs={
            'k': 5,  # Fetch 5 docs
            'fetch_k': 10,  # Consider 10 docs
            'lambda_mult': 0.5  # Balance relevance/diversity
        }
    )

    return RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True,
        chain_type_kwargs={"prompt": PROMPT},  # Use custom prompt
        input_key="question",
        output_key="result"
    )