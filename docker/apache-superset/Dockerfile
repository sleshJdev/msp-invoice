FROM slesh/apache-superset:latest
# Switching to root to install the required packages
USER root
RUN pip uninstall infi.clickhouse_orm \
    && pip install infi.clickhouse_orm==1.0.4 \
    && pip install sqlalchemy-clickhouse
# Switching back to using the `superset` user
USER superset