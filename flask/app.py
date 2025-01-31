from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import langchain_openai as lcai
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
import openai
from openai import AzureOpenAI


load_dotenv("project.env")
endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
api_key = os.getenv("PLATFORM_OPENAI_KEY")
app = Flask(__name__)

embeddings = lcai.AzureOpenAIEmbeddings(
    openai_api_key=os.getenv("AZURE_OPENAI_KEY"),
    openai_api_version="2024-02-15-preview",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    deployment="TEST-Embedding",
)

llmchat = lcai.AzureChatOpenAI(
    openai_api_key=os.getenv("AZURE_OPENAI_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    azure_deployment="PROPILOT",
    openai_api_version="2024-05-01-preview",
    model_name="gpt-4o",
)


def agent_sender_fewshot_twitter_categorized():
    client = llmchat
    prompt = """Your role is to act like a customer seeking support. \
                You are messaging a service representative via the support chat.\
                You ONLY play the role of the customer. Do NOT play the role of the representative. \
                Style your complaint based on your feelings. \
                Initiate the chat with a ONLY ONE complaint message.\
                Ensure the complaint is concise and limited to 2 sentences.\
                Generate a realistic initial complaint from a customer in a {domain} setting.\

                Complaints can be of the following types:\
                - Service Quality: Issues related to the immediate experience of human-to-human service interactions, such as delays, staff behavior, and communication errors.\
                - Product Issues: Concerns related to physical or functional aspects of a product or service, including defects, mismatches between expectation and reality, safety, and accessibility.\
                - Pricing and Charges: Financial discrepancies encountered before, during, or after the service, including overcharging, undisclosed fees, or refund problems.\
                - Policy: The rules and guidelines set by the company that impact customer experiences, especially when these policies lead to grievances due to perceived unfairness or inflexibility. This category encompasses non-price-related issues that don't fit under other categories but should have a policy in place.\
                - Resolution: The actions taken by a company to address and resolve complaints, focusing on the effectiveness and customer satisfaction with the solutions provided. This should mainly include responses made after a complaint has been submitted, and response has been received, where the customer still remains dissatisfied with the resolution.\

                Category: Product Issues
                Domain: Mobile Network 
                Feeling: You are NOT grateful. You are NOT ranting. You are NOT expressive.\
                Complaint: Thank you AppleSupport I updated my phone and now it is even slower and barely works Thank you for ruining my phone.\

                Category: Product Issues
                Domain: Airline
                Feeling: You are NOT grateful. You are NOT ranting. You are NOT expressive.\
                Complaint: SouthwestAir Why would we be receiving errors when we try to checkin Our flight takes off at 4 but we keep getting error messages.\

                Categories: Product Issues
                Domain: Airline             
                Feeling: You are NOT grateful. You are NOT ranting. You are NOT expressive.\
                Complaint: delta this has been my inflight studio experience today Nothing works except Twitter.\

                Category: Service Quality
                Domain: Airline            
                Feeling: You are NOT grateful. You are NOT ranting. You are NOT expressive.\
                Complaint: I really hadthe WORST experience ever from start to finish with SouthwestAir will never fly internationally again with them.\

                Category: Service Quality
                Domain: Hotel
                Feeling: You are NOT grateful. You are NOT ranting. You are expressive.\
                Complaint: Fsomebody from VerizonSupport please help meeeeee  Im having the worst luck with your customer service.\

                Category: Service Quality
                Domain: Trains
                Feeling: You are NOT grateful. You are NOT ranting. You are expressive.\
                Complaint: VirginTrains so i wait almost 3 hours and then they are rude and arrogant amp unhelpful after which she is raising a technical case.\

                Category: Pricing and Charges
                Domain: Airline
                Feeling: You are NOT grateful. You are ranting. You are NOT expressive.\
                Complaint:  DELTA i booked my flight using delta amex card Checking in now amp was being charged for baggage. \

                Category: Pricing and Charges
                Domain: Airline 
                Feeling: You are NOT grateful. You are ranting. You are NOT expressive.\
                Complaint:  Im sorry what Its going to COST me 50 to transfer 4000 AA Advantage points to my spouse AmericanAir this is ridiculous.\

                Category: Pricing and Charges
                Domain: Airline
                Feeling: You are NOT grateful. You are ranting. You are expressive.\
                Complaint: Categories: Pricing and Charges. \

                Category: Policy
                Domain: Hotel
                Feeling: You are NOT grateful. You are ranting. You are expressive.\
                Complaint: Hey  were gonna need to talk about all these pending charges that keep going through my account 5 days after the transaction was made Im getting real irritated \

                Category: Resolution
                Domain: Airline
                Feeling: You are NOT grateful. You are ranting. You are expressive.\
                Complaint:  delta  moves you to  the moment you have a  with no results Just got some   but no real reason why they changed our. \

                Category: Resolution
                Domain: Airline                                                    
                Feeling: You are grateful. You are NOT ranting. You are NOT expressive.\
                Complaint: Delta why wasnt earlier flight offered when I tried to rebook not cool at all Just happened to look at moniter after deplaning.\

                Category: Resolution
                Domain: Airline   
                Feeling: You are grateful. You are NOT ranting. You are expressive.\
                Complaint: Hi British_Airways My flight from MANLHRBWI for Nov 3 was canceled I was excited to try your Club 787 product Only available flight is now to IAD which is a hassle but rebooked anywaymy only option Any availability in first class on BA293 for the troubles please \

                Category: {category}
                Domain: {domain}
                Feeling: You are {is_grateful}. You are {is_ranting}. You are {is_expression}.\
                Complaint:
            """
    template = ChatPromptTemplate.from_messages(
        [
            ("system", prompt),
        ]
    )
    chain = template | client
    return chain

sender_initial = agent_sender_fewshot_twitter_categorized()
@app.route('/')
def index():
    complaint_parameters = {
        "domain": "pizza",
        "category": "service",
        "is_grateful": 'grateful',
        "is_ranting": 'ranting',
        "is_expression": 'expressive',
    }

    response = sender_initial.invoke(complaint_parameters)
    print(response)
    return response

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, threaded=True)
