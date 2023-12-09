FROM oven/bun

WORKDIR /usr/src/app

# Update default packages
RUN apt-get update

# Get Ubuntu packages
RUN apt-get install -y \
    build-essential \
    curl \
    git

# Update new packages
RUN apt-get update

# Get Rust
# RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
RUN curl -sSf https://sh.rustup.rs | sh -s -- --default-toolchain stable -y
RUN apt-get update


RUN echo 'source $HOME/.cargo/env' >> $HOME/.bashrc
ENV PATH="/root/.cargo/bin:${PATH}"


RUN rustup target add wasm32-unknown-unknown

RUN RUSTFLAGS="-C link-args=-rdynamic" cargo install --force cargo-stylus


COPY package*.json bun.lockb ./
RUN bun install





COPY . .

ENV NODE_ENV production

CMD [ "bun", "run", "dev" ]